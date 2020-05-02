"""
Regression algorithm template
"""


class Solver:

    def fit(self, feature_train, target_train, params):
        """Fit the model using feature_train as training data and target_train as target values

        Parameters
        ----------
        feature_train: list, traing data. Example [[a, b, c], [e, f, g]]
        target_train: list, Target values of label. Example [1, 2, 3, 2, 1]
        params: dict, params from frontend
        return: None
        """
        pass

    def predict(self, feature_test):
        """Predict the data using fit model

        Parameters
        ----------
        feature_test: list, test data, Example [[a, b, c], [e, f, g]]
        return: list, predict values of label. Example [1, 2, 3, 2, 1]
        """
        pass

