"""
Association rule algorithm template
"""


class Solver:

    def solve(self, data, params):
        """
        Parameters
        ----------
        data : list of itemsets, example [('a', 'b', 'c'), ('a', 'b', 'd'), ('f', 'b', 'g')]
        params : dict, from frontend component params
        return : need return itemsets and rules
                example itemsets {1 : {(a,) : 3, (b,) : 4}, 2 : {(a,b,) : 2}}
                example rules [{lhs: [a, b],
                                rhs: [c],
                                conf: 0.5,
                                supp: 0.5,
                                lift: 1.0,
                                conv: 0.0,
                                rpg, 0.25,
                                count_full: 3,
                                count_lhs: 4,
                                count_rhs: 4}]
        """
        pass
