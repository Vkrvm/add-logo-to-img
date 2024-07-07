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
        const tasks = Array.from(images).map(img => {
            const container = img.parentElement;
            const resizeWidth = resizeWidthInput.value;
            const resizeHeight = resizeHeightInput.value;
            const shouldResize = resizeEnableCheckbox.checked;

            if (shouldResize) {
                return resizeImage(img, resizeWidth, resizeHeight).then(resizedImg => {
                    return applyLogoToImage(resizedImg).then(finalImg => {
                        container.replaceChild(finalImg, img);
                    });
                });
            } else {
                return applyLogoToImage(img).then(finalImg => {
                    container.replaceChild(finalImg, img);
                });
            }
        });

        Promise.all(tasks).then(() => hideOverlay());
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

    function resizeImage(img, maxWidth, maxHeight) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            let width = imgWidth;
            let height = imgHeight;

            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;

                if (width > height) {
                    width = maxWidth;
                    height = Math.round(maxWidth / aspectRatio);
                } else {
                    height = maxHeight;
                    width = Math.round(maxHeight * aspectRatio);
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImg = new Image();
            resizedImg.src = canvas.toDataURL();
            resizedImg.onload = function() {
                resolve(resizedImg);
            };
        });
    }

    function applyLogoToImage(img) {
        return new Promise((resolve) => {
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
                    resolve(finalImg);
                };
            };
        });
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
