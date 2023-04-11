var cropper;

$(document).ready(function () {
    var $cropper_image = $('#image');
    var $container = $('#container');

    //check if a image is selected in the file upload
    $('.custom-file-input').change(function () {
        var file = $(this)[0].files[0];

        //destroy cropper if it exists
        if (cropper != null) {
            cropper.destroy();
        }

        //read the image and show on the page
        var reader = new FileReader();

        reader.onload = function (e) {
            $cropper_image.attr('src', e.target.result);
            $cropper_image.show();
            $container.show();

            //start cropper.js
            startCropper();
        };

        reader.readAsDataURL(file);
    });

    //tooltips
    bindTooltip();
});


//this initializes the cropper
function startCropper() {
    var image = document.getElementById('image');
    var actions = document.getElementById('cropper-actions');

    //this makes the tooltip dissapear on the button clicks otherwise they could be persistent
    $('.cropper-buttons .btn:not(.bound)').addClass('bound').bind('click', function () {
        $(this).tooltip('hide');
    });

    //cropper options
    var options = {
        aspectRatio: NaN,
        crop: function () {
            var cropperdata = JSON.stringify(cropper.getData(true));
            $('#cropper_data').val(cropperdata);
        }
    };

    //build the cropper
    cropper = new Cropper(image, options);

    //bind the cropper functions to the buttons
    actions.querySelector('.cropper-buttons').onclick = function (event) {
        var e = event || window.event;
        var target = e.target || e.srcElement;
        var cropped;
        var result;
        var input;
        var data;

        if (!cropper) {
            return;
        }

        while (target !== this) {
            if (target.getAttribute('data-method')) {
                break;
            }

            target = target.parentNode;
        }

        if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
            return;
        }

        data = {
            method: target.getAttribute('data-method'),
            target: target.getAttribute('data-target'),
            option: target.getAttribute('data-option') || undefined,
            secondOption: target.getAttribute('data-second-option') || undefined
        };

        cropped = cropper.cropped;

        if (data.method) {
            if (typeof data.target !== 'undefined') {
                input = document.querySelector(data.target);

                if (!target.hasAttribute('data-option') && data.target && input) {
                    try {
                        data.option = JSON.parse(input.value);
                    } catch (e) {
                        console.log(e.message);
                    }
                }
            }



            result = cropper[data.method](data.option, data.secondOption);

            switch (data.method) {
                case 'rotate':
                    if (cropped && options.viewMode > 0) {
                        cropper.crop();
                    }
                    break;

                case 'scaleX':
                case 'scaleY':
                    target.setAttribute('data-option', -data.option);
                    break;

                case 'reset':
                    var cropboxdata = cropper.getCropBoxData(true);
                    var canvasdata = cropper.getCanvasData(true);
                    cropboxdata.left = canvasdata.left;
                    cropboxdata.top = canvasdata.top;
                    cropboxdata.width = canvasdata.width;
                    cropboxdata.height = canvasdata.height;
                    cropper.setCropBoxData(cropboxdata)
                    $cropper_data.val('');
                    $cropper_message_container.hide();
                    $cropper_docrop.prop('checked', '');
                    break;

                case 'destroy':
                    cropper = null;

                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                        uploadedImageURL = '';
                        image.src = originalImageURL;
                    }
                    break;
            }

            if (typeof result === 'object' && result !== cropper && input) {
                try {
                    input.value = JSON.stringify(result);
                } catch (e) {
                    console.log(e.message);
                }
            }
        }
    };

    //make the image move on keyboard input
    document.body.onkeydown = function (event) {
        var e = event || window.event;

        if (e.target !== this || !cropper || this.scrollTop > 300) {
            return;
        }

        try {
            switch (e.keyCode) {
                case 65:
                case 37:
                    //left (arrow left, a)
                    e.preventDefault();
                    cropper.move(-1, 0);
                    break;

                case 87:
                case 38:
                    //up (arrow up, w)
                    e.preventDefault();
                    cropper.move(0, -1);
                    break;

                case 68:
                case 39:
                    //right (arrow right, d)
                    e.preventDefault();
                    cropper.move(1, 0);
                    break;

                case 83:
                case 40:
                    //down (arrow down, s)
                    e.preventDefault();
                    cropper.move(0, 1);
                    break;

                case 187:
                case 107:
                    //zoom in (+ and numpad +)
                    e.preventDefault();
                    cropper.zoom(0.1);
                    break;

                case 189:
                case 109:
                    //zoom out (- and numpad -)
                    e.preventDefault();
                    cropper.zoom(-0.1);
                    break;

                case 27:
                case 8:
                case 46:
                    //reset (esc, del, backspace)
                    e.preventDefault();
                    cropper.reset();
                    break;

                case 81:
                    //rotate ccw (q)
                    e.preventDefault();
                    cropper.rotate(-1);
                    break;

                case 69:
                    //rotate cw (e)
                    e.preventDefault();
                    cropper.rotate(1);
                    break;
            }
        }
        catch (err) {
        }
    };
}


//makes the bootstrap tooltip work
function bindTooltip() {
    if ($(window).width() < 768)
        return;

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}