using System;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Drawing;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System.IO;

namespace WebApplication1
{
    public class Cropper
    {
        public static byte[] doCropperStuff(CropperData cropperData, byte[] oldImage)
        {
            //some variables
            int cropX = (int)Math.Abs(cropperData.x);
            int cropY = (int)Math.Abs(cropperData.y);
            int cropWidth = (int)cropperData.width;
            int cropHeight = (int)cropperData.height;
            int imageWidth = 0;
            int imageHeight = 0;
            int posX = 0;
            int posY = 0;

            //the background color used when the crop dimensions are outside the image
            var fillColor = new Rgba32(96, 111, 145);

            //create a new memorystream and load the image
            using (var stream = new MemoryStream())
            using (var image = Image.Load(new MemoryStream(oldImage)))
            {
                //auto orient the image
                image.Mutate(x => x.AutoOrient());

                //flip horizontal
                if (cropperData.scaleX == -1)
                {
                    image.Mutate(x => x.Flip(FlipMode.Horizontal));
                }

                //flip vertical
                if (cropperData.scaleY == -1)
                {
                    image.Mutate(x => x.Flip(FlipMode.Vertical));
                }

                //rotate
                if (cropperData.rotate != 0)
                {
                    image.Mutate(x => x.Rotate(cropperData.rotate).BackgroundColor(fillColor));
                }

                imageWidth = image.Width;
                imageHeight = image.Height;

                //check the dimensions and position of the crop and calculate image size and crop position
                //X-axis
                if (cropperData.x < 0 && cropX + cropWidth > imageWidth)
                {
                    imageWidth = cropWidth;
                    posX = cropX;
                    cropX = 0;
                }
                else if (cropperData.x < 0)
                {
                    imageWidth = imageWidth + cropX;
                    posX = cropX;
                    cropX = 0;
                }
                else if (cropX + cropWidth > imageWidth)
                {
                    imageWidth = cropX + cropWidth;
                }

                //Y-axis
                if (cropperData.y < 0 && cropY + cropHeight > imageHeight)
                {
                    imageHeight = cropHeight;
                    posY = cropY;
                    cropY = 0;
                }
                else if (cropperData.y < 0)
                {
                    imageHeight = imageHeight + cropY;
                    posY = cropY;
                    cropY = 0;
                }
                else if (cropY + cropHeight > imageHeight)
                {
                    imageHeight = cropY + cropHeight;
                }

                //create a new image with the correct dimension for the image and the crop
                using (var newImage = new Image<Rgba32>(Configuration.Default, imageWidth, imageHeight, fillColor))
                {
                    //position the image onto the new one
                    newImage.Mutate(x => x.DrawImage(image, new Point(posX, posY), 1));

                    //now do the actual cropping
                    newImage.Mutate(x => x.Crop(new Rectangle(cropX, cropY, cropWidth, cropHeight)).BackgroundColor(fillColor));

                    //set the compression level and save the image to a memory stream (100 = best quality image)
                    newImage.Save(stream, new JpegEncoder { Quality = 100 });

                    //maak van de stream een byte array
                    return stream.ToArray();
                }
            }
        }


        public class CropperData
        {
            public double x { get; set; }
            public double y { get; set; }
            public double width { get; set; }
            public double height { get; set; }
            public int rotate { get; set; }
            public int scaleX { get; set; }
            public int scaleY { get; set; }
        }
    }
}