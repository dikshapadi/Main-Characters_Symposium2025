import torch
from TTS.api import TTS
from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# Initialize TTS with FreeVC model
device = "cuda" if torch.cuda.is_available() else "cpu"
tts = TTS(model_name="voice_conversion_models/multilingual/vctk/freevc24", progress_bar=False).to(device)

# Default model settings for parameters (logged but not applied, as FreeVC doesn't support tuning)
DEFAULT_MODEL_SETTINGS = {
    "enhancement_level": 0.6,  # 60%
    "background_noise_reduction": 0.75,  # 75%
    "clarity_enhancement": 0.5,  # 50%
    "voice_preservation": 0.8  # 80%
}

# Create absolute path for temp directory
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'device': device,
        'model': 'voice_conversion_models/multilingual/vctk/freevc24',
        'default_model_settings': DEFAULT_MODEL_SETTINGS,
        'note': 'Parameters are logged but not applied, as FreeVC does not support direct tuning.'
    })

@app.route('/voice-clone', methods=['POST'])
def voice_clone():
    try:
        # Check for source and target audio files
        if 'source' not in request.files or 'target' not in request.files:
            return jsonify({'error': 'Missing source or target audio file'}), 400

        source_file = request.files['source']
        target_file = request.files['target']

        # Validate file names and extensions
        allowed_extensions = {'wav', 'mp3'}
        for f in [source_file, target_file]:
            if not f.filename or '.' not in f.filename:
                return jsonify({'error': f'Invalid filename for {f.name}. Must have a valid extension (WAV or MP3)'}), 400
            extension = f.filename.rsplit('.', 1)[-1].lower()
            if extension not in allowed_extensions:
                return jsonify({'error': f'Invalid file type for {f.name}. Use WAV or MP3'}), 400

        # Extract model settings from request form data (if provided)
        model_settings = DEFAULT_MODEL_SETTINGS.copy()
        if request.form:
            try:
                enhancement_level = request.form.get('enhancement_level', DEFAULT_MODEL_SETTINGS["enhancement_level"])
                # Map string values to numeric
                enhancement_map = {'light': 0.3, 'moderate': 0.6, 'strong': 0.9}
                model_settings["enhancement_level"] = float(enhancement_map.get(enhancement_level, enhancement_level))
                model_settings["background_noise_reduction"] = float(request.form.get('background_noise_reduction', DEFAULT_MODEL_SETTINGS["background_noise_reduction"]))
                model_settings["clarity_enhancement"] = float(request.form.get('clarity_enhancement', DEFAULT_MODEL_SETTINGS["clarity_enhancement"]))
                model_settings["voice_preservation"] = float(request.form.get('voice_preservation', DEFAULT_MODEL_SETTINGS["voice_preservation"]))
            except (ValueError, KeyError):
                return jsonify({'error': 'Invalid model settings. Parameters must be numeric or valid enhancement level (light, moderate, strong).'}), 400

        # Print model settings to terminal with warning
        print("Fetched Model Settings (Note: Parameters are logged but not applied, as FreeVC does not support direct tuning):")
        for key, value in model_settings.items():
            print(f"  {key}: {value}")

        # Validate model settings ranges (0.0 to 1.0)
        for key, value in model_settings.items():
            if not 0.0 <= value <= 1.0:
                return jsonify({'error': f'Invalid value for {key}. Must be between 0.0 and 1.0'}), 400

        # Generate unique filenames
        source_path = os.path.join(UPLOAD_FOLDER, secure_filename(source_file.filename))
        target_path = os.path.join(UPLOAD_FOLDER, secure_filename(target_file.filename))
        output_path = os.path.join(UPLOAD_FOLDER, 'output.wav')

        # Save uploaded files
        source_file.save(source_path)
        target_file.save(target_path)

        # Process voice conversion without parameter tuning
        tts.voice_conversion_to_file(
            source_wav=source_path,
            target_wav=target_path,
            file_path=output_path
        )

        # Prepare and send response
        response = make_response(send_file(
            output_path,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='cloned-voice.wav'
        ))

        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'

        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        # Clean up temporary files
        for filepath in [source_path if 'source_path' in locals() else None,
                        target_path if 'target_path' in locals() else None,
                        output_path if 'output_path' in locals() else None]:
            if filepath and os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except:
                    pass

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)