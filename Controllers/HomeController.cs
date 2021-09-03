using Newtonsoft.Json;
using System;
using System.IO;
using System.Web.Mvc;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View(new HomeViewModel());
        }


        [HttpPost]
        public ActionResult Index(HomeViewModel model)
        {
            //check if the values are present
            if (model.image_upload == null || string.IsNullOrEmpty(model.cropper_data))
            {
                return View(model);
            }

            //use newtonsoft.json to deserialize the posted cropper data into a custom class
            var cropperData = JsonConvert.DeserializeObject<Cropper.CropperData>(model.cropper_data);

            //use a memorystream to get the uploaded image as a byte array
            using (MemoryStream stream = new MemoryStream())
            {
                model.image_upload.InputStream.Position = 0;
                model.image_upload.InputStream.CopyTo(stream);

                //get the cropped image as byte array
                var binary_image = Cropper.doCropperStuff(cropperData, stream.ToArray());

                //make the image a base64 stream to display on the page
                model.cropper_image = string.Format("data:image/jpeg;base64,{0}", Convert.ToBase64String(binary_image));
            }

            return View(model);
        }
    }
}