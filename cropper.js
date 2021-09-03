setTimeout(function () {
    //check if a image is selected
    $('.custom-file-input').change(function () {
        var file = $(this)[0].files[0];
        var $cropper_image = $('#image');

        //read the image and show on the page
        var reader = new FileReader();
        reader.onload = function (e) {
            $cropper_image.attr('src', e.target.result);
            $cropper_image.show();

            //start cropper.js
            startCropper();
        };

        reader.readAsDataURL(file);
    });

    //this initializes the cropper
    function startCropper() {
        const image = document.getElementById('image');
        const cropper = new Cropper(image, {
            aspectRatio: NaN,
            crop(event) {
                var cropperdata = JSON.stringify(cropper.getData(true));
                $('#cropper_data').val(cropperdata);
            },
        });
    }
}, 50);