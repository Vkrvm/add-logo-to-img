document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('upload-button');
    const imageUploadInput = document.getElementById('image-upload');
    const applyLogoButton = document.getElementById('apply-logo-button');
    const applyResizeButton = document.getElementById('apply-resize-button');
    const applyLogoResizeButton = document.getElementById('apply-logo-resize-button');
    const downloadButton = document.getElementById('download-button');
    const imageGallery = document.getElementById('image-gallery');
    const logoPositionSelect = document.getElementById('logo-position');
    const logoWidthInput = document.getElementById('logo-width');
    const logoHeightInput = document.getElementById('logo-height');
    const resizeEnableCheckbox = document.getElementById('resize-enable');
    const resizeWidthInput = document.getElementById('resize-width');
    const resizeHeightInput = document.getElementById('resize-height');
    const logoPositionResizeSelect = document.getElementById('logo-position-resize');
    const logoWidthResizeInput = document.getElementById('logo-width-resize');
    const logoHeightResizeInput = document.getElementById('logo-height-resize');
    const overlay = document.getElementById('overlay');
    let logoSrc = '';
    let logoResizeSrc = '';

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

    document.getElementById('logo-upload').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                logoSrc = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('logo-upload-resize').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                logoResizeSrc = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    applyResizeButton.addEventListener('click', function() {
        const images = document.querySelectorAll('.image-preview img');
        showOverlay();
        const tasks = Array.from(images).map(img => {
            const container = img.parentElement;
            const cropWidth = parseInt(resizeWidthInput.value);
            const cropHeight = parseInt(resizeHeightInput.value);
            const shouldResize = resizeEnableCheckbox.checked;

            if (shouldResize) {
                return cropImage(img, cropWidth, cropHeight).then(croppedImg => {
                    container.replaceChild(croppedImg, img);
                });
            }
        });

        Promise.all(tasks).then(() => hideOverlay());
    });

    applyLogoButton.addEventListener('click', function() {
        const images = document.querySelectorAll('.image-preview img');
        showOverlay();
        const tasks = Array.from(images).map(img => {
            const container = img.parentElement;
            return applyLogoToImage(img).then(finalImg => {
                container.replaceChild(finalImg, img);
            });
        });

        Promise.all(tasks).then(() => hideOverlay());
    });

    applyLogoResizeButton.addEventListener('click', function() {
        const images = document.querySelectorAll('.image-preview img');
        showOverlay();
        const tasks = Array.from(images).map(img => {
            const container = img.parentElement;
            return applyLogoToImage(img, true).then(finalImg => {
                container.replaceChild(finalImg, img);
            });
        });

        Promise.all(tasks).then(() => hideOverlay());
    });

    downloadButton.addEventListener('click', function() {
        const images = document.querySelectorAll('.image-preview img');
        showOverlay();
        let counter = 1;
        images.forEach(img => {
            downloadImage(img, counter);
            counter++;
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

    function cropImage(img, width, height) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            // Calculate the cropping area
            let offsetX = (imgWidth - width) / 2;
            let offsetY = (imgHeight - height) / 2;

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, offsetX, offsetY, width, height, 0, 0, width, height);

            const croppedImg = new Image();
            croppedImg.src = canvas.toDataURL();
            croppedImg.onload = function() {
                resolve(croppedImg);
            };
        });
    }

    function applyLogoToImage(img, isResizeTab = false) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const logo = new Image();
            logo.src = isResizeTab ? logoResizeSrc : logoSrc;

            logo.onload = function() {
                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;

                canvas.width = imgWidth;
                canvas.height = imgHeight;
                ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

                const logoWidth = parseInt(isResizeTab ? logoWidthResizeInput.value : logoWidthInput.value);
                const logoHeight = parseInt(isResizeTab ? logoHeightResizeInput.value : logoHeightInput.value);
                const position = isResizeTab ? logoPositionResizeSelect.value : logoPositionSelect.value;
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

    function downloadImage(img, counter) {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `image_with_logo_${counter}.png`;
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

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Open the first tab by default
document.querySelector('.tab button').click();
