from pygridmap import gridtiler


#cell transformation function
def cell_transformation_fun(c):

    #extract x and y from grid cell code
    a = c['GRD_ID'].split("N")[1].split("E")
    c["x"] = int(a[1])
    c["y"] = int(a[0])

    #delete unecessary data
    del c['GRD_ID']
    del c['CNTR_ID']

print("Transformation")
gridtiler.grid_transformation("assets/pop_5000m.csv", cell_transformation_fun, "tmp/pop_5000.csv")



print("Aggregation to 10 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_10000.csv", 2, 0)
print("Aggregation to 20 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_20000.csv", 4, 0)
print("Aggregation to 50 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_50000.csv", 10, 0)



print("Tiling 5000m")
gridtiler.grid_tiling("tmp/pop_5000.csv", "tmp/5000", 5000)
print("Tiling 10 000m")
gridtiler.grid_tiling("tmp/pop_10000.csv", "tmp/10000", 10000)
print("Tiling 20 000m")
gridtiler.grid_tiling("tmp/pop_20000.csv", "tmp/20000", 20000)
print("Tiling 50 000m")
gridtiler.grid_tiling("tmp/pop_50000.csv", "tmp/50000", 50000)
