import cv2
import os
import glob

def extract_frames():
    output_dir = 'frames'
    os.makedirs(output_dir, exist_ok=True)
    
    # Clean previous frames
    for old_file in glob.glob(os.path.join(output_dir, '*.jpg')):
        try:
            os.remove(old_file)
        except OSError:
            pass
            
    scenes = sorted(glob.glob('scenes/scene*.mp4'))
    print(f'Found {len(scenes)} scenes.')
    
    frames_per_scene = 60 # 60 frames per scene = 300 total frames
    global_frame_count = 0
    
    for scene_idx, scene_path in enumerate(scenes):
        cap = cv2.VideoCapture(scene_path)
        total_vid_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        print(f'Processing {scene_path}: {total_vid_frames} frames at {fps:.1f} fps')
        
        step = max(1, total_vid_frames / frames_per_scene)
        
        for i in range(frames_per_scene):
            frame_num = int(i * step)
            cap.set(cv2.CAP_PROP_POS_FRAMES, min(frame_num, total_vid_frames - 1))
            ret, frame = cap.read()
            if not ret:
                break
            
            # Full original frame (NO cropping)
            h, w = frame.shape[:2]
            target_width = 1280
            target_height = int(h * (target_width / w))
            full_frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)
            
            filename = f'frame_{global_frame_count:04d}.jpg'
            filepath = os.path.join(output_dir, filename)
            
            # Save crisp JPEG (quality 85)
            cv2.imwrite(filepath, full_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
            global_frame_count += 1
            
        cap.release()
        
    print(f'Successfully extracted {global_frame_count} full uncropped frames into {output_dir}/!')

if __name__ == '__main__':
    extract_frames()
