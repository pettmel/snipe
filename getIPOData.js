var _IPO = (function() {
//UTILITY Functions
    function progressUpdate(requestTicket) {
        current = initial; //the value on each function call
        $("#progressbar").progressbar({
            value: current
        });
        if (current >= max) clearInterval(interval);
        initial += 1000; //choose how fast to the number will grow
        console.log(current);
    };
    var intvlProgress = setInterval(progressUpdate, 1000, requestTickets =rotip\\); //choose how fast to update
	var guid = (function() {
	  function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
				   .toString(16)
				   .substring(1);
	  }
	  return function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			   s4() + '-' + s4() + s4() + s4();
	  };
	})();
	var fmt_YYYYMM_FromDate = function(dt){
		return ""+dt.Year+"-"+dt.Month;
	}
	function isInChannel(param, element, index, array){
		return(element.ChanId == param);
	}
	var getProgress = function(requestTicket){
		var openQueries = ChanOpenQueries.filter(isInChannel,requestTicket).length || 1;
		var closedQueries = ChanClosedQueries.filter(isInChannel,requestTicket).length || 0;
		return 100 * closedQueries / openQueries
	}
//Members
	var ChanOpenQueries = new Array();
	var ChanClosedQueries = new Array();
	var IpoQuery = function(chanId, callOrder, queryString){
		this.ChanId = chanId;
		this.CallOrder = callOrder;
		this.Query = queryString;
		this.ResponseData = "";
		this.ResponseError = "";
		this.CallbackSuccess = function(data) {
								   var html = jQuery.parseHTML(data);
								   ResponseData = $(html).find( '.genTable' ).text();								   
								   console.log(ResponseData);
								   ChanClosedQueries.push(new IpoQuery(ChanId,CallOrder,Query));
							   };
		this.CallbackError = function(err) {
								 ResponseError = err;
								 console.log(err);
								 ChanClosedQueries.push(new IpoQuery(ChanId,CallOrder,Query));
							 };
	}
	var datasourceName = "Nasdaq"
	   ,datasourceUrl = "http://www.nasdaq.com/markets/ipos/activity.aspx?tab=filings&month={YYYY-MM}";
	var _getIPOData = function(bTodayOnly, startDate, endDate){
		var requestTicket = new guid();
		console.log('Getting IPO data from ' + datasourceName);
		if(bTodayOnly){
			console.log("Printing Today's IPO Data");
			console.log(getIPOsToday(requestTicket));
		}
		else{
			console.log("Printing Monthly Historical IPO Data:");
			console.log(startDate + "through" + endDate);
			console.log(getIPOHistory(requestTicket,startDate,endDate));
		}
		return requestTicket;
	}
	var _showIPODataRequestStatus = function(requestTicket){
		
	}
	var getIPOsToday = function(requestTicket){
		var data = "";
		var today = new Date();
		var startMonth = new Date(today.getFullYear()+"-"+(today.getMonth()+1)+"-1");
		data = getIPOHistory(requestTicket, startMonth, today);
		return data;
	}
	var getIPOHistory = function(requestTicket, startDate, endDate){
		var chanId = requestTicket, iCount = 0;
		var nextDate = new Date(startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-1");
		var stopDate = new Date(endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-1");
		do{
			var targetDateParam = fmt_YYYYMM_FromDate(nextDate);
			var targetUrl = datasourceUrl.replace("{YYYY-MM}", targetDateParam);
			var query = new IpoQuery(chanId,iCount,targetUrl);
			ChanOpenQueries.push(query);
			jQuery.ajax({
				url: targetUrl,
				type: "GET",
				dataType: "html",
				success: query.CallbackSuccess,
				err: query.CallbackError
			});
			nextDate = new Date(new Date(nextDate).setMonth(nextDate.getMonth()+1));
			iCount = iCount++;
		}while(nextDate <= endDate)
	}
	
	return {
		DataSource: {Name: datasourceName, URL: datasourceUrl}
	   ,Utils: {getIPOData: _getIPOData}
	}	
})();

jQuery(function(){
	jQuery('#btn-getIPOData').on('click', function(){
		console.log("Starting IPO data fetch...");
		var todayOnly = true, showProgress = true;
		_IPO.Utils.getIPOData(todayOnly, showProgress);
	});
});

/*
jQuery.ajax({
        url: "http://www.nasdaq.com/markets/ipos/activity.aspx?tab=filings&month=2011-03",
        type: "GET",
        dataType: "html",
          success: function(data) {
              console.log($(data).filter( '.heading_bold' ).text()); 
          }
    });
	
success: function(data) {
   var html = $.parseHTML(data); 
   console.log($(html).find( '.heading_bold' ).text()); 
}
*/