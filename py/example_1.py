from pygridmap import gridtiler


def transfo(c):
    c["x"] = 0
    c["y"] = 0
    print(c)
    return

gridtiler.grid_transformation("assets/pop_5000m.csv", transfo, "tmp/pop_5000m_prep.csv")

