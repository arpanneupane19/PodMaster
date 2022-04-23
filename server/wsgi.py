# Code written by Arpan Neupane.
# Copyright (c) Arpan Neupane 2022-23. All rights reserved.

from configs import *
from models import *
from routes import *

if __name__ == "__main__":
    db.create_all()
    app.run(debug=True, port='8080')
