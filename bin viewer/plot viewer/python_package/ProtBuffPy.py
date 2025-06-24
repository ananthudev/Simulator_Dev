import sys
from Buffer_pb2 import Buffer

def read_serialized_data(file_path):
    with open(file_path, "rb") as f:
        serialized_data = f.read()
    return serialized_data

def deserialize_person(serialized_data):
    person = Buffer()
    person.ParseFromString(serialized_data)
    return person

def main():
    file_path = "Outputs/bin/Garuda_Projectile.bin"  # Path to the serialized data file
    serialized_data = read_serialized_data(file_path)
    message = deserialize_person(serialized_data)

    
    for i in message.vehRange.time:
       print(i)
    
    
    # for key, value in message.my_map.items():
    #     print(key,message.my_map[key].time,message.my_map[key].comment)

if __name__ == "__main__":
    main()
