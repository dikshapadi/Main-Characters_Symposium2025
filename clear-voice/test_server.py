import requests

def test_voice_clone():
    url = 'http://127.0.0.1:5000/voice-clone'
    
    # Prepare the files
    files = {
        'source': open('test_files/source.wav', 'rb'),
        'target': open('test_files/target.wav', 'rb')
    }
    
    try:
        response = requests.post(url, files=files)
        
        if response.status_code == 200:
            # Save the output file
            with open('test_output.wav', 'wb') as f:
                f.write(response.content)
            print("Success! Output saved as test_output.wav")
        else:
            print(f"Error: {response.json()}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Close the files
        for f in files.values():
            f.close()

if __name__ == "__main__":
    test_voice_clone()