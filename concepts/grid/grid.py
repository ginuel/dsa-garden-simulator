# Python code has no concern with game concept
class GridConceptModel:
    def __init__(self, size=8):
        self.size = size
        self.grid = [[0 for _ in range(size)] for _ in range(size)]
