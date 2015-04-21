// JavaScript Document


var app = {

	loadRequirements: 0,

	pages: [],
	numLinks: 0,
	numPages: 0,

	c: null,
	c_thumb: null,
	context: null,
	i: null,

	init: function () {
		document.addEventListener("deviceready", app.onDeviceReady);
		document.addEventListener("DOMContentLoaded", app.onDomReady);

	},
	onDeviceReady: function () {
		//console.log("working 2");
		console.log(device.uuid);

		app.loadRequirements++;
		if (app.loadRequirements === 2) {
			app.start();
		}
	},
	onDomReady: function () {
		//console.log("working 1");
		app.loadRequirements++;
		if (app.loadRequirements === 2) {
			app.start();
		}
	},
	start: function () {
		console.log("ready to go");
		pages = document.querySelectorAll('[data-role="page"]');
		numPages = pages.length;
		var links = document.querySelectorAll('[data-role="pagelink"]');
		numLinks = links.length;
		for (var i = 0; i < numLinks; i++) {
			//console.log( links[i] );
			links[i].addEventListener("click", app.handleNav, false);
		}
		app.loadPage(null);
//		document.querySelector("#takePic").addEventListener("click", app.takePic);

		//document.querySelector(".grid").addEventListener("click", app.fullImage);
		//document.querySelector(".caption").addEventListener("click", app.delete);

		document.getElementById("btnCancel").addEventListener("click", app.cancel);
        document.addEventListener("scroll", app.handleScrolling, false);
	},

	handleNav: function (ev) {
		ev.preventDefault();
		var href = ev.target.href;
		var parts = href.split("#");
		app.loadPage(parts[1]);
		return false;
	},

	loadPage: function (url) {
		if (url == null) {
			//home page first call
			pages[0].style.display = 'block';
			history.replaceState(null, null, "#grid");
		} else {
			//no longer on the home page... show the back    
			for (var i = 0; i < numPages; i++) {
				if (pages[i].id == url) {
					pages[i].style.display = "block";
					history.pushState("#" + url);
				} else {
					pages[i].style.display = "none";
				}
			}
		}

		if ((url == "grid") || (url == null)) {
			console.log("ready to load thumbnails");
			app.loadImageGrid();
		} else if (url == "camera") {
			console.log("ready to take a pic")
			app.takePic();
		}

	},
    handleScrolling: function(ev){
        var height = window.innerHeight;
        var offset = window.pageYOffset;
        var tabHeight = 80;
        var tabs = document.querySelector(".tabs");
        tabs.style.position = "absolute";
        var total = height + offset - tabHeight;
        tabs.style.top = total + "px";
    },

	loadImageGrid: function (ev) {
		console.log("loading image grid");

		var url = "http://m.edumedia.ca/carp0052/mad9022/final-w15/list.php?dev=" + device.uuid;
		//var postData = "?dev=" + device.uuid;
		sendRequest(url, app.listThumbs, null);
		console.log(url);

	},

	listThumbs: function (xhr) {
		console.log("thumbnails listed");
		//alert(xhr.responseText);
		var ul = document.querySelector("#imageList");
		//clear list if anything was already in there
		ul.innerHTML = "";
		var imageArray = JSON.parse(xhr.responseText);
		//console.log(imageArray.length);
		//alert(app.imageArray.id);
		for (i = 0; i < imageArray.thumbnails.length; i++) {
			
			console.log(imageArray.thumbnails[i].id);
			var li = document.createElement("li");
			li.setAttribute("imageId", imageArray.thumbnails[i].id);

			var thumbImage = document.createElement("img");
			thumbImage.addEventListener("click", app.fetchFullImage)

			var deleteBtn = document.createElement("button");
			deleteBtn.setAttribute("imageId", imageArray.thumbnails[i].id);
			deleteBtn.className = 'caption';

			var deleteBtnCaption = document.createTextNode("Delete"); // Create a text node
			deleteBtn.appendChild(deleteBtnCaption); // Append the text to 
			deleteBtn.addEventListener("click", app.deleteImage);

			thumbImage.src = imageArray.thumbnails[i].data;
			console.log(imageArray.thumbnails[0]);
			li.appendChild(thumbImage);
			li.appendChild(deleteBtn);
			ul.appendChild(li);
		}

	},

	takePic: function () {
		navigator.camera.getPicture(app.cameraSuccess, app.cameraError, {
			quality: 50,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: Camera.PictureSourceType.CAMERA
		});
	},

	cameraSuccess: function (imageURI) {
		console.info("success");
		app.i = document.createElement("img");

		app.c = document.getElementById('c');
		app.c_thumb = document.getElementById('c_thumb');

		//good idea to set the size of the canvas in Javascript in addition to CSS
		app.c.height = 433.333;
		app.c.width = 600;
		app.context = app.c.getContext('2d');

		//thumb
		app.c_thumb.height = 130;
		app.c_thumb.width = 180;
		app.context_thumb = app.c_thumb.getContext('2d');

		app.i.addEventListener("load", function (ev) {
			//load to canvas after the image is loaded
			app.context.drawImage(app.i, 0, 0, app.c.width, app.c.height);
			app.context_thumb.drawImage(app.i, 0, 0, app.c_thumb.width, app.c_thumb.height);
		});
		//context.drawImage(app.i, 0, 0, app.c.width, app.c.height);
		app.i.crossOrigin = "";
		app.i.src = imageURI;

		document.getElementById("setText").addEventListener("click", app.setText);
		document.getElementById("savePic").addEventListener("click", app.savePic);

	},

	cameraError: function (message) {
		console.log('Failed because: ' + message);

	},

	setText: function (ev) {
		ev.preventDefault();

		var txt = document.getElementById("text").value;
		var txtTop = document.getElementById("top").checked;
		//var txtBottom = document.getElementById("bottom").checked;

		var w = app.c.width;
		var h = app.c.height;
		var middle = app.c.width / 2;
		var bottom = app.c.height - 50;
		var top = app.c.height - 390;

		var w_thumb = app.c_thumb.width;
		var h_thumb = app.c_thumb.height;
		var middle_thumb = app.c_thumb.width / 2;
		var bottom_thumb = app.c_thumb.height - 20;
		var top_thumb = app.c_thumb.height - 110;

		if (txt != "") {
			//clear the canvas
			if (txtTop == true) {
				//Full
				app.context.clearRect(0, 0, app.c.w, app.c.h);
				//reload the image		
				app.context.drawImage(app.i, 0, 0, w, h);
				//THEN add the new text to the image						
				app.context.font = "30px sans-serif";
				app.context.fillStyle = "fb797b";
				app.context.textAlign = "center";
				app.context.fillText(txt, middle, top);

				//Thumb
				app.context_thumb.clearRect(0, 0, app.c_thumb.w, app.c_thumb.h);
				//reload the image		
				app.context_thumb.drawImage(app.i, 0, 0, w_thumb, h_thumb);
				//THEN add the new text to the image						
				app.context_thumb.font = "15px sans-serif";
				app.context_thumb.fillStyle = "fb797b";
				app.context_thumb.textAlign = "center";
				app.context_thumb.fillText(txt, middle_thumb, top_thumb);
				
			} else {
				app.context.clearRect(0, 0, app.c.w, app.c.h);
				//reload the image		
				app.context.drawImage(app.i, 0, 0, w, h);
				//THEN add the new text to the image						
				app.context.font = "30px sans-serif";
				app.context.fillStyle = "fb797b";
				app.context.textAlign = "center";
				app.context.fillText(txt, middle, bottom);
				

				//Thumb
				app.context_thumb.clearRect(0, 0, app.c_thumb.w, app.c_thumb.h);
				//reload the image		
				app.context_thumb.drawImage(app.i, 0, 0, w_thumb, h_thumb);
				//THEN add the new text to the image						
				app.context_thumb.font = "15px sans-serif";
				app.context_thumb.fillStyle = "#fb797b";
				app.context_thumb.textAlign = "center";
				app.context_thumb.fillText(txt, middle_thumb, bottom_thumb);
			}
		}
	},

	savePic: function (ev) {
		ev.preventDefault();
		//alert("clicked");
		var fulljpeg = app.c.toDataURL("image/jpeg");
		var thumbjpeg = app.c_thumb.toDataURL("image/jpeg");
		fulljpeg = encodeURIComponent(fulljpeg);
		thumbjpeg = encodeURIComponent(thumbjpeg);
		var url = "http://m.edumedia.ca/carp0052/mad9022/final-w15/save.php";
		var postData = "dev=" + device.uuid + "&thumb=" + thumbjpeg + "&img=" + fulljpeg;
		sendRequest(url, app.imgSaved, postData);
	},

	imgSaved: function (xhr) {
		alert("Image has been saved!");
	},


	cancel: function (ev) {
		document.querySelector("[data-role=modal]").style.display = "none";
		document.querySelector("[data-role=overlay]").style.display = "none";
	},

	fetchFullImage: function (ev) {
//		document.querySelector("[data-role=modal]").style.display = "block";
//		document.querySelector("[data-role=overlay]").style.display = "block";

		var imageId = ev.target.parentNode.getAttribute("imageId");
	//	alert(imageId);
		var url = "http://m.edumedia.ca/carp0052/mad9022/final-w15/get.php?dev=" + device.uuid + "&img_id=" + imageId;
		//alert(url);
		sendRequest(url, app.showFullImage, null);
	},

	showFullImage: function (xhr) {
		//ev.stopPropagation();

		document.querySelector("[data-role=modal]").style.display = "block";
		document.querySelector("[data-role=overlay]").style.display = "block";

		var fullImage = JSON.parse(xhr.responseText);
		//alert(fullImage.id);
		var modal = document.getElementById("fullsizeModal");
		var img = document.getElementById("fullsize");
		img.src = fullImage.data;
		//console.log(img);
		
		modal.appendChild(img);

	},

	deleteImage: function (ev) {
		//remove modal event listener
		//alert("delete me!");
		document.querySelector("[data-role=modal]").style.display = "none";
		document.querySelector("[data-role=overlay]").style.display = "none";
		
		var btnId = ev.target.parentNode.getAttribute("imageId");
	//	alert(imageId);
		var url = "http://m.edumedia.ca/carp0052/mad9022/final-w15/delete.php?dev=" + device.uuid + "&img_id=" + btnId;
		//alert(url);
		sendRequest(url, app.imageDelete, null);
	},
	
	imageDelete: function(xhr){
		alert("Image Deleted");
		app.loadImageGrid();
	},
}

app.init();