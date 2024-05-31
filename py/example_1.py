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

print("Transformation")
gridtiler.grid_transformation("assets/pop_5000m.csv", cell_transformation, "tmp/pop_5000m_prep.csv")

