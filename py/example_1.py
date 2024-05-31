from pygridmap import gridtiler


#cell transformation function
def cell_transformation(c):

    #extract x and y from grid cell code
    a = c['GRD_ID'].split("N")[1].split("E")
    c["x"] = int(a[1])
    c["y"] = int(a[0])

    #delete unecessary data
    del c['GRD_ID']
    del c['CNTR_ID']

"""
print("Transformation")
gridtiler.grid_transformation("assets/pop_5000m.csv", cell_transformation, "tmp/pop_5000m_prep.csv")

print("Aggregation to 10 000m")
gridtiler.grid_aggregation("tmp/pop_5000m_prep.csv", 5000, "tmp/pop_10000m_prep.csv", 2, 0)
print("Aggregation to 20 000m")
gridtiler.grid_aggregation("tmp/pop_5000m_prep.csv", 5000, "tmp/pop_20000m_prep.csv", 4, 0)
print("Aggregation to 50 000m")
gridtiler.grid_aggregation("tmp/pop_5000m_prep.csv", 5000, "tmp/pop_50000m_prep.csv", 10, 0)
"""

