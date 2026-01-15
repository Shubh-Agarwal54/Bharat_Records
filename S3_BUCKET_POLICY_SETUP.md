# S3 Bucket Policy Setup for Profile Pictures

## Issue
Profile pictures are uploading successfully to AWS S3, but they're not displaying in the frontend because the S3 bucket doesn't allow public read access.

## Solution
You need to add a bucket policy to allow public read access to profile pictures.

### Steps:

1. **Go to AWS S3 Console**: https://s3.console.aws.amazon.com/

2. **Select your bucket**: `bharat-records-storage`

3. **Go to Permissions tab**

4. **Scroll down to "Bucket policy"**

5. **Click "Edit" and paste this policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadProfilePictures",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bharat-records-storage/users/*/profile-picture.*"
    }
  ]
}
```

6. **Click "Save changes"**

### What this policy does:
- Allows **public read access** to profile pictures only
- Only affects files matching the pattern: `users/*/profile-picture.*`
- Other files in the bucket remain private
- Users can view profile pictures without authentication

### Verify it works:
After applying the policy, try this URL in your browser:
```
https://bharat-records-storage.s3.ap-south-1.amazonaws.com/users/6954db65c525a9bff4b10d9c/profile-picture.png
```

If it shows the image instead of an "Access Denied" XML error, the policy is working correctly!

### Alternative: Make entire bucket public (NOT RECOMMENDED)
If you want to make the entire bucket public (not recommended for security):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bharat-records-storage/*"
    }
  ]
}
```

## Current Status
- ✅ S3 uploads working perfectly
- ✅ URLs being saved to database correctly
- ✅ Backend returning all user fields (dob, aadhaar, pan, profilePicture)
- ❌ Images not accessible due to bucket permissions
- **Next step**: Apply the bucket policy above
