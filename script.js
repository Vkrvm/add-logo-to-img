document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('upload-button');
    const imageUploadInput = document.getElementById('image-upload');
    const logoUploadInput = document.getElementById('logo-upload');
    const applyLogoButton = document.getElementById('apply-logo-button');
    const downloadButton = document.getElementById('download-button');
    const imageGallery = document.getElementById('image-gallery');
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
        images.forEach(img => {
            applyLogoToImage(img);
        });
    });

    downloadButton.addEventListener('click', function() {
        const images = document.querySelectorAll('.image-preview img');
        images.forEach(img => {
            downloadImage(img);
        });
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

    function applyLogoToImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const logo = new Image();
        logo.src = logoSrc;

        logo.onload = function() {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            const logoWidth = logo.width / 4;
            const logoHeight = logo.height / 4;
            ctx.drawImage(logo, canvas.width - logoWidth - 10, canvas.height - logoHeight - 10, logoWidth, logoHeight);

            img.src = canvas.toDataURL();
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
});
