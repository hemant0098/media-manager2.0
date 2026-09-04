const API_URL = window.APP_CONFIG.API_URL;
let xhr = null;

const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", uploadFile);

function showToast(message, type = "success") {


    const toast = document.getElementById("toast");

    toast.innerText = message;

    toast.className = type;

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);


}

function showLoader(fileName = "") {

    document.getElementById("uploadModal").style.display = "flex";

    document.getElementById("uploadFileName").innerText = fileName;

}

function hideLoader() {

    document.getElementById("uploadModal").style.display = "none";

}

async function uploadFile() {


    const file = fileInput.files[0];

    if (!file) return;

    showLoader(file.name);

    const formData = new FormData();

    formData.append("file", file);

    try {

        xhr = new XMLHttpRequest();

        xhr.open("POST", `${API_URL}/upload`, true);

        const startTime = Date.now();

        xhr.upload.onprogress = (event) => {

            if (!event.lengthComputable) return;

            const percent = (event.loaded / event.total) * 100;

            document.getElementById("progressFill").style.width =
                percent + "%";

            document.getElementById("progressPercent").innerText =
                percent.toFixed(0) + "%";

            //--------------------------------

            const elapsed = (Date.now() - startTime) / 1000;

            const speed = event.loaded / elapsed;

            //--------------------------------

            document.getElementById("uploadSpeed").innerText =
                (speed / 1024 / 1024).toFixed(2) + " MB/s";

            //--------------------------------

            const uploadedMB =
                (event.loaded / 1024 / 1024).toFixed(2);

            const totalMB =
                (event.total / 1024 / 1024).toFixed(2);

            document.getElementById("uploadedSize").innerText =
                `${uploadedMB} MB / ${totalMB} MB`;

            //--------------------------------

            const remainingBytes =
                event.total - event.loaded;

            const remainingSeconds =
                remainingBytes / speed;

            if (isFinite(remainingSeconds)) {

                document.getElementById("uploadETA").innerText =
                    `${Math.ceil(remainingSeconds)} sec remaining`;

            }

        };

        xhr.onload = () => {

            hideLoader();

            if (xhr.status === 200) {

                const data = JSON.parse(xhr.responseText);

                if (data.success) {

                    showToast("Upload Successful");

                    loadFiles();

                    fileInput.value = "";

                } else {

                    showToast("Upload Failed", "error");

                }

            } else {

                showToast("Upload Failed", "error");

            }

        };
        xhr.onerror = () => {

            hideLoader();

            showToast("Network Error", "error");

        };

        xhr.send(formData);


    } catch (error) {

        hideLoader();

        showToast("Upload failed", "error");

        console.error(error);
    }
    xhr.onabort = () => {

        hideLoader();

        fileInput.value = "";

        showToast("Upload Cancelled", "error");

    };


}

document
    .getElementById("cancelUploadBtn")
    .addEventListener("click", () => {

        if (xhr) {

            xhr.abort();

        }

    });

async function loadFiles() {

    showLoader();

    try {

        const response = await fetch(`${API_URL}/files`);

        if (!response.ok) {
            throw new Error("Failed to fetch files");
        }

        const files = await response.json();

        const mediaGrid = document.getElementById("mediaGrid");

        mediaGrid.innerHTML = "";

        let totalSize = 0;
        let imageCount = 0;
        let videoCount = 0;

        files.forEach(file => {

            if (!file || !file.url || !file.key) return;

            totalSize += Number(file.size || 0);

            const isImage = /\.(jpg|jpeg|png|gif|webp|jfif|svg)$/i.test(file.key);

            const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(file.key);

            if (isImage) imageCount++;
            if (isVideo) videoCount++;

            const card = document.createElement("div");

            card.className = "media-card";

            card.innerHTML = `
                <div class="card-menu">
                    <button type="button" onclick="toggleMenu(this)">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>

                    <div class="dropdown">
                        <button type="button" onclick="deleteFile('${encodeURIComponent(file.key)}')">
                            Delete
                        </button>
                    </div>
                </div>

                <a href="${file.url}" target="_blank">

                    ${isImage
                    ? `<img src="${file.url}" class="media-preview" loading="lazy" alt="${file.key}">`

                    : isVideo
                        ? `<video class="media-preview" muted controls preload="metadata">
                                <source src="${file.url}">
                           </video>`

                        : `<div class="media-preview file-preview">
                                <i class="fa-solid fa-file"></i>
                           </div>`
                }

                </a>

                <div class="file-info">
                    <p title="${file.key}">
                        ${file.key}
                    </p>
                </div>
            `;

            mediaGrid.appendChild(card);
        });

        document.getElementById("totalFiles").innerText = files.length;
        document.getElementById("imageCount").innerText = imageCount;
        document.getElementById("videoCount").innerText = videoCount;
        document.getElementById("totalSize").innerText =
            (totalSize / (1024 * 1024)).toFixed(2) + " MB";

        const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024;

        const usedPercentage =
            Math.min((totalSize / STORAGE_LIMIT) * 100, 100);

        document.getElementById("storagePercent").innerText =
            usedPercentage.toFixed(2) + "%";

        document.getElementById("storageBar").style.width =
            usedPercentage + "%";

    } catch (error) {

        console.error(error);

        showToast("Failed to load files", "error");

    } finally {

        hideLoader();

    }
}

function toggleMenu(btn) {


    document.querySelectorAll(".dropdown")
        .forEach(menu => menu.classList.remove("show"));

    btn.nextElementSibling.classList.toggle("show");


}

async function deleteFile(key) {


    const confirmDelete =
        confirm("Delete this file?");

    if (!confirmDelete) return;

    try {

        await fetch(
            `${API_URL}/files/${(key)}`,
            {
                method: "DELETE"
            }
        );
        // console.log(key);
        showToast("File deleted");

        loadFiles();

    } catch (error) {

        showToast("Delete failed", "error");

        console.error(error);
    }


}

document.addEventListener("click", e => {


    if (!e.target.closest(".card-menu")) {

        document.querySelectorAll(".dropdown")
            .forEach(menu =>
                menu.classList.remove("show")
            );
    }

});
window.addEventListener("DOMContentLoaded", () => {

    document.getElementById("uploadModal").style.display = "none";

});


loadFiles();
