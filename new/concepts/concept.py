class Variables:
    def __init__(self, name="Ginuel", gold=0, day=0):
        self.name = name
        self.gold = gold
        self.day = day

    def set_val(self, k, v):
        setattr(self, k, v)
        return self.get_vals()

    def get_vals(self):
        return {"name": self.name, "gold": self.gold, "day": self.day}

var_engine = Variables("Ginuel", 0, 0)
