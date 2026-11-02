def calculate_sale(base_val, weather_mult, is_debug):
    if is_debug:
        return 100
    return int(base_val * weather_mult)
