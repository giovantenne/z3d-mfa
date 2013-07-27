/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Z3D.
 *
 * The Initial Developer of the Original Code is
 * Claudio Benvenuti 
 * www.claudiobenvenuti.it
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * 
 * ***** END LICENSE BLOCK ***** */





function Z3dmfa(){


	this.costruttore= function(){
		this.scostamento=1;
		this.zTimer=50;
		this.zAltezza=16;
		this.workaroundTimer=150;
		this.linkZoom=true;
		this.rimbalza=true;
		this.rimbalzaFreq=6;
		this.rimbalzaGrande=true;
		this.hideBkImage=false;
		this.colorL="#FF0000";
		this.colorR="00FFFF";
		this.profondita=1/4;
		this.z3dAttivo=false;
		this.loaded=false;
		this.rimbalzaCount=0;
		this.linkArray="0-0";
		this.notspace = /\S/;
		this.myID=0;
		this.debug="";
		this.myDebug="";
		this.myDelay=1;

	}

	this.initVar = function(){
		var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);	
		this.hideBkImage=prefManager.getBoolPref("extensions.z3d-mfa.hideBkImage");
		this.linkZoom=prefManager.getBoolPref("extensions.z3d-mfa.linkZoom");
		this.rimbalza=prefManager.getBoolPref("extensions.z3d-mfa.rimbalza");
		this.rimbalzaGrande=prefManager.getBoolPref("extensions.z3d-mfa.rimbalzaGrande");
		this.scostamento=prefManager.getIntPref("extensions.z3d-mfa.scostamento");
		this.zTimer=prefManager.getIntPref("extensions.z3d-mfa.zTimer");
		this.zAltezza=prefManager.getIntPref("extensions.z3d-mfa.zAltezza");
		this.rimbalzaFreq=prefManager.getIntPref("extensions.z3d-mfa.rimbalzaFreq");
		glassesType=prefManager.getIntPref("extensions.z3d-mfa.glassesType");
		this.workaroundTimer=prefManager.getIntPref("extensions.z3d-mfa.workaroundTimer");
		if(glassesType==1){
			this.colorL="#FF0000";
			this.colorR="#00FFFF";
		}else if (glassesType==2){
			this.colorL="#FF0000";
			this.colorR="#0000FF";
		}else if (glassesType==3){
			this.colorL="#FF0000";
			this.colorR="#00FF00";
		}else if (glassesType==4){
			this.colorL="#CF7B21";
			this.colorR="#2131FF";
		}
		
	}


	this.myZ3D = function(){
		//content.document.createStyleSheet("chrome://z3d-mfa/content/z3d.css");

		//alert(this.z3dAttivo )
		if(this.z3dAttivo && (!this.loaded) && (!this.spanLoadedPresent()) ){
			
			this.loaded=true;		
			var loadedVar=content.document.createElement('span');
			loadedVar.setAttribute("ID", "loaded");	
			content.document.body.appendChild(loadedVar);
			var styles = "@import url('chrome://z3d-mfa/content/z3d.css');";
			var newSS=content.document.createElement('link');
			newSS.rel='stylesheet';
			newSS.href='data:text/css,'+escape(styles);
			content.document.getElementsByTagName("head")[0].appendChild(newSS);
			this.initVar();
			//loader();		
			this.startZ3D();
			//unloader();
		}
	}
	this.spanLoadedPresent=function(){
		var el=content.document.getElementById("loaded");		
		if(el==null){
			return false;
		 }
		return true;
	}
	this.loader=function (){
		var newElement = content.document.createElement('div');
		newElement.style.position="absolute";
		newElement.style.top="0px";
		newElement.style.left="0px";
		newElement.style.width="100%";
		newElement.style.height="100%";
		newElement.style.backgroundColor="#FFFFFF";
		newElement.setAttribute("ID", "z3IDloader");
		var newTextElement = content.document.createTextNode("loading...");
		newElement.appendChild(newTextElement);
		content.document.body.appendChild(newElement);
	}
	this.unloader=function (){
		var el=content.document.getElementById("z3IDloader")
		content.document.body.removeChild(el);
	}
	this.zunload=function (){
		//alert("");	
		this.loaded=false;
	}
	this.setAttivo=function (event){
	
		if (event.button == 0) {
				
				this.zAvvia();
		}
	}
	this.zAvvia=function (){
			
			this.z3dAttivo=!this.z3dAttivo;
			
			if(this.z3dAttivo){
				//document.getElementById("z3d_svlabel").style.textDecoration="line-through";
				document.getElementById("z3d-tools").label="Turn  Z3D Off";
				//document.getElementById("z3d_svlabel").label="Z3D";
				document.getElementById("context-z3d").label="Turn  Z3D Off";
				this.myZ3D();			

			}else{
				document.getElementById("z3d-tools").label="Turn Z3D On";		
				//document.getElementById("z3d_svlabel").label="Z3D";
				document.getElementById("context-z3d").label="Turn Z3D On";
				this.loaded=false;
				content.document.location.reload();
			}
	}



	this.startZ3D=function (){
			content.document.body.style.backgroundImage="url(chrome://z3d-mfa/content/Immagine.bmp)";
			content.document.body.style.backgroundColor="transparent";
			content.document.body.style.backgroundRepeat="repeat";
			this.recursiveNavigate(content.document.body);
			
			this.duplicateNode();
			//alert(this.debug);
	}

	this.recursiveNavigate=function (node){
		var  i=0,  cNodes=node.childNodes, t;	
		while((t=cNodes.item(i++))){
		
			switch(t.nodeType){
				case 1: // Element Node
					if(t.getAttribute("ID")!="z3IDloader"){
						t.style.backgroundColor="transparent";
						if(this.hideBkImage && this.getStyle(t,"background-image")!="none"){
							t.style.backgroundImage="none";
							t.style.border="1px #AAAAAA solid";
							t.style.MozBorderRadius="10px";
						
						}
						t.normalize();		
						this.recursiveNavigate(t);
					}
					break;
				case 3: // Text Node
					//if (this.getStyle(t.parentNode,"display")=="block"){
					if(this.notspace.test(t.nodeValue)  ){
						var newElement = content.document.createElement('span');
						newElement.setAttribute("name", "z3dspan");
						newElement.setAttribute("ID", "z3ID"+this.myID);
						//newElement.style.position="static";
						//newElement.style.border="1px #ff0000 solid";
						var newTextElement = content.document.createTextNode(t.nodeValue);
						newElement.appendChild(newTextElement);
						var b=t.parentNode;
						var a=b.insertBefore(newElement,t);
						var c=b.removeChild(t);
						b.style.visibility="hidden";
						
						b.style.border="1px #ff0000 solid";
						//per non chiamare  this.duplicateNode()					
						/*var myFunction="this.executeDuplication('z3ID"+this.myID+"');";
						window.setTimeout(myFunction,this.workaroundTimer);*/
						this.myDelay++;
					}
				break;
				//}
				case 8: // Comment Node (and Text Node without non-whitespace content)
					node.removeChild(t);
					i--;
			}
			this.myID++;
		}
	}

	this.duplicateNode=function (){
		var myNodes=content.document.getElementsByName("z3dspan");
		for (var i=0; i< myNodes.length;i++){
			var myTmpID="z3n";
			myTmpID=""+myNodes[i].getAttribute("id");
			
			var myFunction="thisobj.executeDuplication('"+myTmpID+"');";
			//alert(myTmpID);
			window.setTimeout(function(thisobj,myTmpID){thisobj.executeDuplication(myTmpID);},this.workaroundTimer,this,myTmpID);
			//this.executeDuplication(myTmpID);
			//window.setTimeout(function(thisobj,myTmpID){thisobj.zz(myTmpID);},150,this,myTmpID);
			this.myDelay++;
				
		}
	}
	this.zz=function(a)
	{
		alert(a);
	}

	this.executeDuplication=function (myObjID)
	{
			//alert(myObjID+" z");
			var myObj=content.document.getElementById(myObjID);

		
			var oldContent=this.replaceSpecials(myObj.innerHTML);
			//alert(oldContent)
			//var oldContent=(myObj.innerHTML).replace(/&nbsp;/g, ' ');
			var newContent="";
			var myPos=this.findPos(myObj);
			var myX=myPos[0];
			var myY=myPos[1];
			
			if (myX==0 || myY==0){
					myObj.style.visibility="visible";
				
			}else{
				
				
			//alert (cascadedstyle(myObj.parentNode.parentNode,"position","position"));
			

			//this.zabsPos(myObj);
				//this.myDebug+=myPos[0]+" "+myPos[1]+"\n";
				
				myScost=parseInt(this.calculateDeep(myObj)*this.profondita);
				
				
				
				//SCRIVI ROSSO
				var newElement = content.document.createElement('div');
				newElement.setAttribute("ID", myObjID+"l");
				newElement.className="m";
				newElement.style.position="absolute";
				newElement.style.color=this.colorL;
				newElement.style.width=(1-1+myObj.offsetWidth)+"px";
				newElement.style.height=(1-1+myObj.offsetHeight)+"px";
				newElement.style.left=(1-1+myX-this.scostamento-myScost)+"px";
				newElement.style.top=1-1+myY+"px";
				var newTextElement = content.document.createTextNode(oldContent);
				newElement.appendChild(newTextElement);
				var aL=myObj.appendChild(newElement);

				//if (oldContent=="Download")
				//alert(myX+" "+myY+" "+ this.getStyle(newElement,"left")+" "+ this.getStyle(newElement,"top")+" "+ this.getStyle(newElement,"position"));			



				//SCRIVI BLU
				var newElement = content.document.createElement('div');
				newElement.setAttribute("ID", myObjID+"r");
				newElement.className="m";
				newElement.style.position="absolute";
				newElement.style.color=this.colorR;
				newElement.style.width=(1-1+myObj.offsetWidth)+"px";
				newElement.style.height=(1-1+myObj.offsetHeight)+"px";
				newElement.style.left=(1-1+myX+this.scostamento+myScost)+"px";
				newElement.style.top=1-1+myY+"px";
				var newTextElement = content.document.createTextNode(oldContent);
				newElement.appendChild(newTextElement);
				var aR=myObj.appendChild(newElement);
				
				
				//if (oldContent=="Download")
				//alert(myX+" "+myY+" "+ this.getStyle(newElement,"left")+" "+ this.getStyle(newElement,"top")+" "+ this.getStyle(newElement,"position"));			
				
				
				
				if (myObj.parentNode.tagName!="A"&&(myObj.parentNode.tagName=="B"||myObj.parentNode.tagName=="STRONG"|| this.getStyle(myObj,"font-weight")=="bold")&&this.rimbalza&&oldContent.length<50){
					if (this.rimbalzaCount%this.rimbalzaFreq==0){
						aR.style.width=this.getStyle(aR,"width").replace("px","")*2+"px";
						aL.style.width=this.getStyle(aL,"width").replace("px","")*2+"px";				
						aR.style.height=this.getStyle(aR,"height").replace("px","")*2+"px";
						aL.style.height=this.getStyle(aL,"height").replace("px","")*2+"px";				

						/*var zBlinkObjL=document.getElementById(myObjID+"l");
						var zBlinkObjR=document.getElementById(myObjID+"r");*/
						var zBlinkObjL=aL;
						var zBlinkObjR=aR;
						zBlinkObjL.style.whiteSpace="nowrap";
						zBlinkObjR.style.whiteSpace="nowrap";
						var ff="this.zblink('"+ myObjID+"','true')";
						window.setTimeout(function(thisobj,myObjID){thisobj.zblink( myObjID,'true');},this.zTime,this,myObjID);
					}
					this.rimbalzaCount++;
				}else if(myObj.parentNode.tagName=="A"&& this.linkZoom&&oldContent.length<50){
					aR.style.width=this.getStyle(aR,"width").replace("px","")*2+"px";
					aL.style.width=this.getStyle(aL,"width").replace("px","")*2+"px";				
					aR.style.height=this.getStyle(aR,"height").replace("px","")*2+"px";
					aL.style.height=this.getStyle(aL,"height").replace("px","")*2+"px";	
					var zDiff=aR.style.left.replace("px","")-aL.style.left.replace("px","");
					var objName=myObj.getAttribute("ID");
					var _this = this;

					myObj.addEventListener("mouseover", function(event) { _this.cresci(objName,zDiff); }, false); 
					myObj.addEventListener("mouseout", function(event) { _this.decresci(objName,zDiff); }, false); 		
					this.linkArray+=";"+objName+"-stand";
				}
			}

	}

			

	this.cresci=function (zmyObjID,originalDist){
		this.setLinkStatus(zmyObjID,"up");
		this.zEseguiCrescita(zmyObjID,originalDist);
	}
	this.decresci=function (zmyObjID,originalDist){
		this.setLinkStatus(zmyObjID,"down");
		this.zEseguiDecrescita(zmyObjID,originalDist);
	}
	this.setLinkStatus=function (zmyObjID,status){
		this.linkArray=this.linkArray.replace(zmyObjID+"-stand",zmyObjID+"-"+status);
		this.linkArray=this.linkArray.replace(zmyObjID+"-up",zmyObjID+"-"+status);
		this.linkArray=this.linkArray.replace(zmyObjID+"-down",zmyObjID+"-"+status);
	}

	this.zEseguiCrescita=function (zmyObjID,originalDist){
		if(this.linkArray.indexOf(zmyObjID+"-down")==-1){
			var zBlinkObjL=content.document.getElementById(zmyObjID+"l");
			var zBlinkObjR=content.document.getElementById(zmyObjID+"r");
			var zDiff=zBlinkObjR.style.left.replace("px","")-zBlinkObjL.style.left.replace("px","");
			if(zDiff<this.zAltezza){
				zBlinkObjL.style.left=zBlinkObjL.style.left.replace("px","")-1+"px";
				zBlinkObjR.style.left=zBlinkObjR.style.left.replace("px","")-1+1+1+"px";
				zBlinkObjL.style.top=zBlinkObjL.style.top.replace("px","")-1+1+1+"px";
				zBlinkObjR.style.top=zBlinkObjR.style.top.replace("px","")-1+1+1+"px";
				if(this.rimbalzaGrande){		
					zBlinkObjL.style.fontSize=100+zDiff*2+"%";
					zBlinkObjR.style.fontSize=100+zDiff*2+"%";
					/*var nFont=zBlinkObjL.innerHTML.length;
					nFont=nFont-nFont/3
					zBlinkObjL.style.width=zBlinkObjL.style.width.replace("px","")-1+1+nFont+"px";
					zBlinkObjR.style.width=zBlinkObjR.style.width.replace("px","")-1+1+nFont+"px";				
					zBlinkObjL.style.fontSize=this.getStyle(zBlinkObjL,"font-size").replace("px","")-1+1+1+"px";
					zBlinkObjR.style.fontSize=this.getStyle(zBlinkObjR,"font-size").replace("px","")-1+1+1+"px";*/
					
				}	
				var zmyFunction="this.zEseguiCrescita('"+zmyObjID+"','"+originalDist+"');";
				window.setTimeout(function (thisobj,zmyObjID,originalDist){thisobj.zEseguiCrescita(zmyObjID,originalDist);},this.zTimer,this,zmyObjID,originalDist);
			}else{
				this.linkArray=this.linkArray.replace(zmyObjID+"-up",zmyObjID+"-stand");
			}
		}
	}

	this.zEseguiDecrescita=function (zmyObjID,originalDist){
		if(this.linkArray.indexOf(zmyObjID+"-up")==-1){
			var zBlinkObjL=content.document.getElementById(zmyObjID+"l");
			var zBlinkObjR=content.document.getElementById(zmyObjID+"r");
			var zDiff=(zBlinkObjR.style.left.replace("px",""))-parseInt(zBlinkObjL.style.left.replace("px",""));
			if(zDiff>originalDist){
				zBlinkObjL.style.left=zBlinkObjL.style.left.replace("px","")-1+1+1+"px";
				zBlinkObjR.style.left=zBlinkObjR.style.left.replace("px","")-1+"px";
				zBlinkObjL.style.top=zBlinkObjL.style.top.replace("px","")-1+"px";
				zBlinkObjR.style.top=zBlinkObjR.style.top.replace("px","")-1+"px";
				if(this.rimbalzaGrande){			
					zBlinkObjL.style.fontSize=100+zDiff*2+"%";
					zBlinkObjR.style.fontSize=100+zDiff*2+"%";
					/*var nFont=zBlinkObjL.innerHTML.length;
					nFont=nFont-nFont/3
					zBlinkObjL.style.fontSize=this.getStyle(zBlinkObjL,"font-size").replace("px","")-1+"px";
					zBlinkObjR.style.fontSize=this.getStyle(zBlinkObjR,"font-size").replace("px","")-1+"px";
					zBlinkObjL.style.width=zBlinkObjL.style.width.replace("px","")-1+1-nFont+"px";
					zBlinkObjR.style.width=zBlinkObjR.style.width.replace("px","")-1+1-nFont+"px";*/
				}		
				var zmyFunction="this.zEseguiDecrescita('"+zmyObjID+"','"+originalDist+"');";
				//window.setTimeout(zmyFunction,this.zTimer);
				window.setTimeout(function (thisobj,zmyObjID,originalDist){thisobj.zEseguiDecrescita(zmyObjID,originalDist);},this.zTimer,this,zmyObjID,originalDist);
			}else{
				this.linkArray=this.linkArray.replace(zmyObjID+"-up",zmyObjID+"-stand");
				zBlinkObjL.style.fontSize=100+"%";
				zBlinkObjR.style.fontSize=100+"%";
			}
		}
	}




	//var cresce=true;
	this.zblink=function (zmyObjID,cresce){
		var zBlinkObjL=content.document.getElementById(zmyObjID+"l");
		var zBlinkObjR=content.document.getElementById(zmyObjID+"r");
		var zDiff=zBlinkObjR.style.left.replace("px","")-zBlinkObjL.style.left.replace("px","");
		if	(zDiff<0){
			cresce="true";
		}else if(zDiff>this.zAltezza){
			cresce="false";
		}
		if(cresce=="true"){
			zBlinkObjL.style.left=zBlinkObjL.style.left.replace("px","")-1+"px";
			zBlinkObjR.style.left=zBlinkObjR.style.left.replace("px","")-1+1+1+"px";
			zBlinkObjL.style.top=zBlinkObjL.style.top.replace("px","")-1+1+1+"px";
			zBlinkObjR.style.top=zBlinkObjR.style.top.replace("px","")-1+1+1+"px";
		}else{
			zBlinkObjL.style.left=zBlinkObjL.style.left.replace("px","")-1+1+1+"px";
			zBlinkObjR.style.left=zBlinkObjR.style.left.replace("px","")-1+"px";
			zBlinkObjL.style.top=zBlinkObjL.style.top.replace("px","")-1+"px";
			zBlinkObjR.style.top=zBlinkObjR.style.top.replace("px","")-1+"px";
		}
		if(this.rimbalzaGrande){
			/*if(cresce=="true"){
				zBlinkObjL.style.width=1-1+parseInt(zBlinkObjL.style.width.replace("px",""))+zDiff+"px";
				zBlinkObjR.style.width=1-1+parseInt(zBlinkObjR.style.width.replace("px",""))+zDiff+"px";
			}else{
				zBlinkObjL.style.width=1-1+parseInt(zBlinkObjL.style.width.replace("px",""))-zDiff+"px";
				zBlinkObjR.style.width=1-1+parseInt(zBlinkObjR.style.width.replace("px",""))-zDiff+"px";
			}*/
			zBlinkObjL.style.fontSize=100+zDiff*2+"%";
			zBlinkObjR.style.fontSize=100+zDiff*2+"%";
		}
		var zmyFunction="this.zblink('"+zmyObjID+"','"+cresce+"');";
		window.setTimeout(function(thisobj,zmyObjID,cresce){thisobj.zblink(zmyObjID,cresce);},this.zTimer,this,zmyObjID,cresce);
	}



	this.findPos=function (ooo) {
		var obj2=ooo;
		var curleft = 0
		var curtop = 0;
		var i=0;
		var positionValue;
		
		if (obj2.offsetParent ) {
				do {
						//if(cascadedstyle(obj2,"position","position")=="absolute")
						//alert(cascadedstyle(obj2,"position","position"));
						
						positionValue=this.getStyle(obj2,"position");
						if( positionValue && (positionValue=="absolute"|| positionValue=="relative")){				
							return [curleft,curtop];
						}
						
						curleft += (1-1+obj2.offsetLeft);
						curtop += (1-1+obj2.offsetTop);
						i++;
				} while (obj2 = obj2.offsetParent);
		}

		return [curleft,curtop];
	}
	/*function findPos(ooo){
		var aa=content.document.getBoxObjectFor(ooo); 
		//var aa=content.document.getBoundingClientRect(ooo); 
		return[aa.x,aa.y];
	}*/

	this.zabsPos=function (o){	
		var positionValue;
		while (o.parentNode) {
			if(!o.nodeValue){
				positionValue=this.getStyle(o,"position");
				if(positionValue && positionValue=="absolute"){
					alert(o.className+" "+positionValue);
				}
				/*var positionValue = current.document.defaultView.getComputedStyle(o, null).getPropertyCSSValue("position").cssText;
				alert(positionValue);*/
			}
			
			o=o.parentNode;
		}
		return false;
	}

	this.calculateDeep=function (o){
		var deep = 0;
		while (o.parentNode) {
			deep++;
			o=o.parentNode;
		}
		return (deep);
	}

	this.trim=function (stringa){
		while (stringa.substring(0,1) == ' '){
			stringa = stringa.substring(1, stringa.length);
		}
		while (stringa.substring(stringa.length-1, stringa.length) == ' '){
			stringa = stringa.substring(0,stringa.length-1);
		}
		return stringa;
	}


	this.replaceSpecials=function (oString)
	{
		var nString = oString;
		
		nString=nString.replace(/<!--([^>]|[^-]>|[^-]->)*-->/g, ' ');
		
		//N.B. could this regular expression be broken up into smaller parts?
		//   [ED. No. It matches both valid and invalid (x)html tags]
		nString=nString.replace(/<[\/!]?[a-z]+\d*(\s+[a-z][a-z\-]*(=[^\s>"']*|="[^"]*"|='[^']*')?)*\s*(\s\/)?>/gi, ' ');

		nString=nString.replace(/[^\S ]+/g, ' ');
		nString=nString.replace(/&lt;/g, '<');
		nString=nString.replace(/&gt;/g, '>');
		nString=nString.replace(/&nbsp;/g, ' ');
		nString=nString.replace(/&quot;/g, '"');
		nString=nString.replace(/&amp;/g, '\t');
		nString=nString.replace(/&#?\w+;/g, ' ');
		nString=nString.replace(/\t/g, '&');
		nString=nString.replace(/ +/g, ' ');
		return nString;
	}




	this.getStyle=function (el,styleProp)
	{
		var x = el;
		if (x.currentStyle)
			var y = x.currentStyle[styleProp];
		else if (window.getComputedStyle)
			var y = content.document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp);
		return y;
	}



	this.zabout=function () {
		window.open('chrome://z3d-mfa/content/about.xul','','chrome,centerscreen');
	}
	this.zpreferences=function () {
		if(this.z3dAttivo){
			/*this.z3dAttivo=!this.z3dAttivo;
			document.getElementById("z3d_svlabel").style.textDecoration="none";
			content.document.location.reload();*/
			this.zAvvia();
		}
		window.open('chrome://z3d-mfa/content/options.xul','','chrome,centerscreen');
	}

	this.needGlasses=function (){
		 window.open("http://z3d.z3n.it/need-glasses");
	}




}









































