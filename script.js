document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('upload-button');
    const imageUploadInput = document.getElementById('image-upload');
    const logoUploadInput = document.getElementById('logo-upload');
    const applyLogoButton = document.getElementById('apply-logo-button');
    const downloadButton = document.getElementById('download-button');
    const imageGallery = document.getElementById('image-gallery');
    const logoPositionSelect = document.getElementById('logo-position');
    const logoWidthInput = document.getElementById('logo-width');
    const logoHeightInput = document.getElementById('logo-height');
    const resizeEnableCheckbox = document.getElementById('resize-enable');
    const resizeWidthInput = document.getElementById('resize-width');
    const resizeHeightInput = document.getElementById('resize-height');
    const overlay = document.getElementById('overlay');
    let logoSrc = '';

    uploadButton.addEventListener('click', function() {
        const files = imageUploadInput.files;
        if (files.length > 0) {
            for (const file of files) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    addImageToGallery(e.target.result, file.name);
                };
                reader.readAsDataURL(file);
            }
            imageUploadInput.value = '';  // Clear the input after uploading
        }
    });

    logoUploadInput.addEventListener('change', function() {
        const file = logoUploadInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                logoSrc = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    applyLogoButton.addEventListener('click', function() {
        const images = document.querySelectorAll('.image-preview img');
        showOverlay();
        images.forEach(img => {
            const container = img.parentElement;
            const resizeWidth = resizeWidthInput.value;
            const resizeHeight = resizeHeightInput.value;
            const shouldResize = resizeEnableCheckbox.checked;

            if (shouldResize) {
                resizeAndCropImage(img, resizeWidth, resizeHeight, function(croppedImg) {
                    applyLogoToImage(croppedImg, function(finalImg) {
                        container.replaceChild(finalImg, img);
                        hideOverlay();
                    });
                });
            } else {
                applyLogoToImage(img, function(finalImg) {
                    container.replaceChild(finalImg, img);
                    hideOverlay();
                });
            }
        });
    });

    downloadButton.addEventListener('click', function() {
        const images = document.querySelectorAll('.image-preview img');
        showOverlay();
        images.forEach(img => {
            downloadImage(img);
        });
        hideOverlay();
    });

    function addImageToGallery(src, name) {
        const div = document.createElement('div');
        div.classList.add('image-preview');

        const img = document.createElement('img');
        img.src = src;
        img.alt = name;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            imageGallery.removeChild(div);
        });

        div.appendChild(img);
        div.appendChild(deleteButton);
        imageGallery.appendChild(div);
    }

    function resizeAndCropImage(img, width, height, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const startX = Math.max(0, (imgWidth - width) / 2);
        const startY = Math.max(0, (imgHeight - height) / 2);

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height);

        const resizedImg = new Image();
        resizedImg.src = canvas.toDataURL();
        resizedImg.onload = function() {
            callback(resizedImg);
        };
    }

    function applyLogoToImage(img, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const logo = new Image();
        logo.src = logoSrc;

        logo.onload = function() {
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            canvas.width = imgWidth;
            canvas.height = imgHeight;
            ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

            const logoWidth = parseInt(logoWidthInput.value);
            const logoHeight = parseInt(logoHeightInput.value);
            const position = logoPositionSelect.value;
            const offset = 40;
            let x = 0;
            let y = 0;

            switch (position) {
                case 'top-left':
                    x = offset;
                    y = offset;
                    break;
                case 'top-right':
                    x = imgWidth - logoWidth - offset;
                    y = offset;
                    break;
                case 'bottom-left':
                    x = offset;
                    y = imgHeight - logoHeight - offset;
                    break;
                case 'bottom-right':
                    x = imgWidth - logoWidth - offset;
                    y = imgHeight - logoHeight - offset;
                    break;
            }

            ctx.drawImage(logo, x, y, logoWidth, logoHeight);

            const finalImg = new Image();
            finalImg.src = canvas.toDataURL();
            finalImg.onload = function() {
                callback(finalImg);
            };
        };
    }

    function downloadImage(img) {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = 'image_with_logo.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function showOverlay() {
        overlay.style.visibility = 'visible';
    }

    function hideOverlay() {
        overlay.style.visibility = 'hidden';
    }
});
