from abc import ABC, abstractmethod



print("in modules Abstract __init__.py")


# TODO: we need to keep in mind that we may not need to pull from this abstract. This should simply give a good idea as to what 
# the other modules need to have in it. I just like abstracts.



# TODO: we need to figure out what all of this needs to be!
class AbstractModule(ABC):
    @abstractmethod
    def get_game(self):
        pass


