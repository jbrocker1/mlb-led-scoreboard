


print("In MLB __init__.py")


# TODO: load config thing!

import debug
import sys
import statsapi

statsapi_version = tuple(map(int, statsapi.__version__.split(".")))
if statsapi_version < (1, 9, 0):
    debug.error("We require MLB-StatsAPI 1.9.0 or higher. You may need to re-run install.sh")
    sys.exit(1)


# statsapi.logger = logger
