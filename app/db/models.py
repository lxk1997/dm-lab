from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, Boolean, text, Index, \
    cast, Numeric
from sqlalchemy.dialects.postgresql import JSONB, BYTEA
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class RoleModel(Base):
    __tablename__ = 'role'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)


class UserModel(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(Text, nullable=False)
    email = Column(Text, nullable=False)
    role_id = Column(Integer, ForeignKey('role.id', ondelete='CASCADE'), nullable=False)
    create_time = Column(DateTime(timezone=False), server_default=func.now())


class ClassesModel(Base):
    __tablename__ = 'classes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    teacher_id = Column(Integer, ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    description = Column(Text)
    invite_code = Column(String(20), nullable=False)
    deleted = Column(Integer, nullable=False)
    create_time = Column(DateTime, server_default=func.now())


class UserClassesRelationModel(Base):
    __tablename__ = 'user_classes_relation'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    classes_id = Column(Integer, ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    deleted = Column(Integer, nullable=False)


class ProjectModel(Base):
    __tablename__ = 'project'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    description = Column(Text)
    content = Column(JSONB, nullable=False, default=dict())
    deleted = Column(Integer, nullable=False)
    create_time = Column(DateTime, server_default=func.now())


class ComponentTypeModel(Base):
    __tablename__ = 'component_type'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(20), nullable=False)
    deleted = Column(Integer, nullable=False)


class ComponentModel(Base):
    __tablename__ = 'component'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    component_type_id = Column(Integer, ForeignKey('component_type.id', ondelete='CASCADE'), nullable=False)
    description = Column(Text)
    is_public = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'))
    deleted = Column(Integer, nullable=False)
    create_time = Column(DateTime, server_default=func.now())


class ExperimentalItemModel(Base):
    __tablename__ = 'experimental_item'
    id = Column(Integer, primary_key=True, autoincrement=True)
    classes_id = Column(Integer, ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(Text)
    deleted = Column(Integer, nullable=False)
    create_time = Column(DateTime, server_default=func.now())


class ExperimentalTaskModel(Base):
    __tablename__ = 'experimental_task'
    id = Column(Integer, primary_key=True, autoincrement=True)
    experimental_item_id = Column(Integer, ForeignKey('experimental_item.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(50), nullable=False)
    content = Column(Text)
    file = Column(BYTEA)
    description = Column(Text)
    deleted = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
    dead_line = Column(DateTime, nullable=False)
    create_time = Column(DateTime, server_default=func.now())


class EvaluationModel(Base):
    __tablename__ = 'evaluation'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    experimental_task_id = Column(Integer, ForeignKey('experimental_task.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(20), nullable=False)
    content = Column(Text)
    create_time = Column(DateTime, server_default=func.now())


class GradeModel(Base):
    __tablename__ = 'grade'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    experimental_task_id = Column(Integer, ForeignKey('experimental_task.id', ondelete='CASCADE'), nullable=False)
    score = Column(Numeric, default=0)
    create_time = Column(DateTime, server_default=func.now())


class DatasetModel(Base):
    __tablename__ = 'dataset'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    experimental_item_id = Column(Integer, ForeignKey('experimental_item.id', ondelete='CASCADE'), nullable=False)
    description = Column(Text)
    file_key = Column(String(100), nullable=False)
    deleted = Column(Integer, nullable=False)
    create_time = Column(DateTime, server_default=func.now())


def init_models(engine):
    Base.metadata.create_all(engine)