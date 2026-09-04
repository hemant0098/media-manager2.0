const {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const s3 = require("../config/s3");

const bucket = process.env.S3_BUCKET;

// Upload File
exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;

    const key = `${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    await s3.send(command);

    const url = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${bucket}/${key}`;

    res.status(200).json({
      success: true,
      file: {
        key,
        url
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Files
exports.getFiles = async (req, res) => {
  try {

    const command = new ListObjectsV2Command({
      Bucket: bucket
    });

    const data = await s3.send(command);

    const files = (data.Contents || []).map(file => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      url: `https://s3.${process.env.AWS_REGION}.amazonaws.com/${bucket}/${file.Key}`
    }));

    res.json(files);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete File
exports.deleteFile = async (req, res) => {
  try {

    const { key } = req.params;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });

    await s3.send(command);

    res.json({
      success: true,
      message: "File deleted"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};