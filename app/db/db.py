import click

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask import current_app, g
from flask.cli import with_appcontext

from .models import init_models

def _get_engine():
    config = current_app.config['PGDB']
    url = 'postgresql://%s:%s@%s:%s/%s' % (config['username'], config['password'], config['host'], config['port'], config['database'])
    engine = create_engine(url, echo=True, pool_size=50)
    return engine

def get_db():
    if 'db' not in g:
        engine = _get_engine()
        Session = sessionmaker(bind=engine)
        session = Session()
        g.db = session
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    engine = _get_engine()
    init_models(engine)

@click.command('init-db')
@with_appcontext
def init_db_command():
    init_db()
    click.echo('Initialized the database.')

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
