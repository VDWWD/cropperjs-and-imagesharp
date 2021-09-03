using System;
using System.ComponentModel.DataAnnotations;
using System.Web;

namespace WebApplication1.Models
{
    public class HomeViewModel
    {
        [Display(Name = "Upload an image")]
        public HttpPostedFileBase image_upload { get; set; }

        public string cropper_data { get; set; }

        public string cropper_image { get; set; }
    }
}