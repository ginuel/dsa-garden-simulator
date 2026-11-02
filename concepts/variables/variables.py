# Python code has no concern with game concept
class VariablesConceptModel:
    def __init__(self):
        self.player_name = "Ginuel"
        self.gold = 0
        self.day_count = 0

    def get_summary(self):
        return f"Player: {self.player_name}, Gold: {self.gold}, Day: {self.day_count}"
