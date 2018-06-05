var MultipleSelect = function(selectId,prop){
	
					this.select = $("#"+selectId);
					this.parentWrapper = this.select.parent();
					this.options = [];
					this.selectedValues = {};
					this.isDependent = false;
					this.dependentOnObj = null;
					this.dependentToObj = null;
					this.prop = null;
					
					if(prop){
						this.prop = prop;
					}else{
						this.prop = {};
						this.prop.backgroundColor = "#89C4D2";
					}
										
					this.pushOptions = function(){
						var self = this;
						self.isDependent = self.select.attr("data-dependent") == 'true' ? true : false;
						this.select.find("option").each(function(){
							var option={};
							option.dataValue = $(this).val();
							option.text = $(this).text();
							
							if(self.isDependent){
								option.dataParent = $(this).attr("data-parent");
							}
							
							self.options.push(option);
						});
						this.select.addClass("noshow");
					},
					
					this.pushDropOptions = function(dropOptionsBox){
						var self = this;
						var wrapper = $("<div></div>");
						if(self.prop.multipleSelect){
							var selectAll = $("<div class='select-all'></div>");
							
							if(self.isDependent){
								selectAll.addClass("noshow");
							}
							selectAll.append("<span>Select All</span>");
							selectAll.on("click",function(){
								$(this).toggleClass("all");
								self.selectAllOptions($(this));
								
							});
							wrapper.append(selectAll);
						}
						$.each(self.options,function(i,val){
							
							var option = $("<div class='option'></div>");
							option.attr("data-value",val.dataValue);
							option.text(val.text);
							if(self.isDependent){
								option.attr("data-parent",val.dataParent);
							}
							
							option.on("click",function(){
								if(self.prop.onChange && typeof self.prop.onChange == 'function'){
									
									self.makeSelected($(this),true); //true for triggering change event
								}else{
									self.makeSelected($(this));
								}
								
								
							});
							wrapper.append(option);
							
						});
						dropOptionsBox.append(wrapper);
					},
					this.selectAllOptions = function(selectAllButton){
						var visibleOptions = this.parentWrapper.find(".drop-options .option:visible");
						var self = this;
						var has = selectAllButton.hasClass("all");
						$.each(visibleOptions,function(i,option){
							if(has){
								self.addToSelectedValues($(option));
								$(option).addClass("selected");
							}else{
								self.deleteFromSelectedValues($(option));
								$(option).removeClass("selected");
							}
						});
						if(self.prop.onChange && typeof self.prop.onChange == 'function' ){
							self.prop.onChange(self.selectedValues);
						}
						if(this.dependentToObj){
							this.refreshChild(this.selectedValues);
						}	
					},
					
					this.makeSelected = function(option,fireChangeEvent){
						
						if(!this.isAlreadyAdded(option)){
							// option is not added to the selected values
							if(this.prop.multipleSelect){
								//multiple selection is allowed
								this.addToSelectedValues(option,fireChangeEvent);
								option.addClass("selected");
								
								
							}else{
								//multiple selection is not allowed
								// remove previous selection
								this.selectedValues = {};
								this.parentWrapper.find(".drop-options .option").removeClass("selected");
								this.addToSelectedValues(option,fireChangeEvent);
								option.addClass("selected");
								
								
							}
							
						}else{
							//option is already added to the selected values
							this.deleteFromSelectedValues(option,fireChangeEvent);
							option.removeClass("selected");
							$(".select-all").removeClass("all");
							
						}
						//this.showSelected(option);
						if(this.dependentToObj){
							this.refreshChild(this.selectedValues);
						}	
					},
					
					this.showSelected = function(option){
						var span = this.parentWrapper.find("span[class='showselected']");
						var numOfSelectedValues = this.objectSize(this.selectedValues);
						if(numOfSelectedValues==0){
							
							span.text("None selected");
						}else if(numOfSelectedValues == 1 ){
							var remainingSelectedValue = this.getRemainingSingleKeyFromSelected();
							
							var remainingSelectedOption = this.parentWrapper.find("div[data-value='"+remainingSelectedValue+"']");
							span.text($(remainingSelectedOption).text());
							
						}else{
							
							span.text(numOfSelectedValues +" selected");
						}
					
						
					},
					this.addToSelectedValues = function(option,fireChangeEvent){
						
						var dataValue = option.attr("data-value");
						var text = option.text();
						if(!this.isAlreadyAdded(option)){
							this.selectedValues[dataValue] = text;
							if(fireChangeEvent && this.prop.onChange && typeof this.prop.onChange == 'function'){
								this.prop.onChange(this.selectedValues);
							}
							this.showSelected(option);
						}
						
					},
					this.isAlreadyAdded = function(option){
						var dataValue = option.attr("data-value");
						if(this.selectedValues[dataValue]){
							return true;
						}else{
							return false;
						}
						
					},
					this.deleteFromSelectedValues = function(option,fireChangeEvent){
						
						var dataValue = option.attr("data-value");
						if(this.isAlreadyAdded(option)){
							delete this.selectedValues[dataValue];
							if(fireChangeEvent && this.prop.onChange && typeof this.prop.onChange == 'function'){
								this.prop.onChange(this.selectedValues);
							}
							this.showSelected(option);
						}
						
					},
					
					this.objectSize = function(obj){
						    var size = 0, key;
						    var obj = this.selectedValues;
						    for (key in obj) {
						        if (obj.hasOwnProperty(key)) size++;
						    }
						    return size;
						
					},
					
					this.getRemainingSingleKeyFromSelected = function(){
						var size = 0, key;
						var obj = this.selectedValues;
					    for (key in obj) {
					        if (obj.hasOwnProperty(key)) size++;
					    }
					    
					    return key;
						
					},
					
					this.searchInOptions = function(str){
						
						var inOptions = null;
						if(this.isDependent){
							inOptions = this.parentWrapper.find("div.option[searchable ='true']");
						}else{
							inOptions = this.parentWrapper.find(".option");
						}
						
						var searchStr = str.trim();
						searchStr = searchStr.replace(/\\/gm, "");
						searchStr = searchStr.replace(/[\+]/gm, "");
						searchStr = searchStr.replace(/[\(]/gm, "");
						searchStr = searchStr.replace(/[\)]/gm, "");
						$.each(inOptions,function(i,val){
							if(searchStr.length == 0 ){
								$(val).show();
							}else{
								var pattern = new RegExp(searchStr,"i","g");
								if( !pattern.test( $(val).text() ) ){
									$(val).hide();
								}else{
									$(val).show();
								}
							}
													
						});
											
					},
					
					this.createOptionBox = function(){
						var self = this;
						var dropOptionWrapper = $("<div class='drop-options-wrapper'></div>");
						var searchableDiv = $("<div contentEditable='true' class='searchable-div' title='search'></div>");
						
						searchableDiv.on("keyup",function(){
							
							self.searchInOptions($(this).text());
						});
						var dropOptions =  $("<div class='drop-options noshow'></div>");
						dropOptions.append(searchableDiv);
						dropOptionWrapper.append(dropOptions);
						return dropOptions;
					},
					
					this.dependentOn = function(obj){
						var self = this;
						this.dependentOnObj = obj;
						if(this.isDependent){
							var argValue = obj.getValuesObject();
							/*var argValueArr = obj.getValuesArray();*/
							
							var options = this.parentWrapper.find(".option");
							$.each(options,function(i,val){
								$(val).removeAttr("searchable").hide();
								
							});
							for(var key in argValue){
								var option = self.parentWrapper.find("div[data-parent='"+key+"']");
								
								if(option.length > 0){
									
									$(option).attr("searchable",'true');
									$(option).show();
								}
								
							};
						}
						
					},
					this.dependentTo = function(obj){
						this.dependentToObj = obj;
						
					},
					this.refreshChild = function(selectedObj){
						this.dependentToObj.refresh(selectedObj);
						/*if(this.dependentToObj){
							this.dependentToObj.refresh();
						}*/
						
					},
					
					this.refresh = function(selectedObj){
						var self = this;
						
						var options = self.parentWrapper.find(".option");
						var selectAllOption = self.parentWrapper.find(".select-all");
						selectAllOption.removeClass("all");
						if($.isEmptyObject(selectedObj)){
							selectAllOption.addClass("noshow");
							$.each(options,function(i,option){
								$(option).removeAttr("searchable").removeClass("selected").hide();
								self.deleteFromSelectedValues($(option));
							});
							
						}else{
							
							$.each(options,function(i,option){
								var dataParent = $(option).attr("data-parent");
								var dataValue  =$(option).attr("data-value");
								selectAllOption.removeClass("all");
								if(selectedObj[dataParent]){
									selectAllOption.removeClass("noshow");
									$(option).attr("searchable",'true');
									$(option).show();
									
								}else{
									$(option).removeAttr("searchable").hide().removeClass("selected");
									self.deleteFromSelectedValues($(option));
								}
							});
								
							
						}
						if(self.prop.onChange && typeof self.prop.onChange == 'function'){
							self.prop.onChange(self.selectedValues);
						}
						if(self.dependentToObj){
							self.refreshChild(self.selectedValues);
						}
						
					},
					
					
					this.icon =  $("<span><i class='fa fa-chevron-circle-down' style='float:right;'></i></span>");
					this.createUi = function(){
						
						var selectWrapper = $("<div class='wrapper'></div>");
						
						var selectBox  = $("<span class='custom-drop'></span>");
						
						selectBox.css("background-color",this.prop.backgroundColor);
						
						var table = $("<table style='width: 100%;'></table>");
						var tr=$("<tr></tr>");
						var showSelectedTd = $("<td></td>");
						var iconTd = $("<td></td>");
						
						showSelectedTd.append("<span class='showselected'>None selected</span>");//this.select.attr("title")
						iconTd.append(this.icon);
						tr.append(showSelectedTd);
						tr.append(iconTd);
						table.append(tr);
						selectBox.append(table);
						
						selectBox.on("click",function(){
							var options = selectWrapper.find(".drop-options-wrapper .drop-options");
							$(options).stop(true,false).slideToggle("medium");	
						});
						
						var optionBox = this.createOptionBox();
						this.pushDropOptions(optionBox);
						
						 selectWrapper.append(selectBox);
						 selectWrapper.append(optionBox.parent());
						 this.parentWrapper.append(selectWrapper);
					},
					
					this.preSelect = function(valueArr){
						
						var self = this;
						$.each(valueArr, function(i,val){
							
							var option = self.parentWrapper.find("div[data-value='"+val+"']");
							
							if(option.length > 0)
								
								self.makeSelected($(option));					
								
						});
						
					},
					
					this.getValuesObject = function(){
						return this.selectedValues;
					},
					
					this.getSelectedValuesForAParentValue = function(id){
						var selectedOptions = this.parentWrapper.find(".drop-options").find(".option.selected[data-parent='"+id+"']");
						var selectedObj = {};
						$.each(selectedOptions,function(i,option){
							var dataValue = $(option).attr("data-value");
							var txt = $(option).text();
							selectedObj[dataValue] = txt;
							
						});
						return selectedObj;
					},
					
					this.pushOptions();
					this.createUi();
			};
$(document).click(function(e){
	// code to close other drop down on click of a drop down and close all drop downs on clicking anywhere else in document
				var allSelectWrapper = $("div[class='wrapper']");
				var select = $(e.target).closest("div[class='wrapper']").siblings("select");
				$.each(allSelectWrapper,function(i,val){
				
					if(select.length!=0){
						var id  = $(val).siblings("select").attr("id");
						var selectedId = select.attr("id");
						if(selectedId != id){
							var options = $(val).find(".drop-options-wrapper .drop-options");
							$(options).stop(true,false).slideUp("medium");
						}
					}else{
						var options = $(val).find(".drop-options-wrapper .drop-options");
						$(options).stop(true,false).slideUp("medium");
					}
					
				});
	
	
	
});
				