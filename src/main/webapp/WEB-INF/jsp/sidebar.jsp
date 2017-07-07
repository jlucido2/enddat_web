
<div id="sidebar">
    <h3 id="mobileMenuText">Menu</h3>
    <i id="hamburger" class="fa fa-bars" aria-hidden="true"></i>
    
    <div id="sidebarMenu">
        
        <div class="accordion">
            
            <div class="accordion-section">
                <a class="accordion-section-title" href="#accordion-1">Resources</a>
                
                <div id="accordion-1" class="accordion-section-content">
                    <p><a href="userguide" target="_blank">User Guide</a></p>
		    <p><a href="servicestatus" target="_blank">Data Source Status</a></p>
                </div><!--end .accordion-section-content-->
            </div><!--accordion section-->
            
            <div class="accordion-section">
                <a class="accordion-section-title" href="#accordion-2">Data Sources</a>
                
                <div id="accordion-2" class="accordion-section-content">
                    <p><a href="http://waterdata.usgs.gov/nwis" target="_blank">USGS Surface Water Time Series</a></p>
                    <p><a href="http://www.rcc-acis.org/" target="_blank">Applied Climate Information System</a></p>
                    <p><a href="http://data.glos.us/glcfs/" target="_blank">Great Lakes Coastal Forecasting System</a></p>
                    <p><a href="http://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/thredds/stageiv_combined/" target="_blank">Radar Indicated Precipitation</a></p>
                    <p><a href="http://dd.weather.gc.ca/" target="_blank">Environment Canada Time Series</a></p>
                </div><!--end .accordion-section-content-->
            </div><!--accordion section-->
            
            <div class="accordion-section">
                <a class="accordion-section-title" href="#accordion-3">Partners</a>
                
                <div id="accordion-3" class="accordion-section-content">
                    <p><a href="https://water.usgs.gov/watercensus/" target="_blank">National Water Census</a></p>
                    <p><a href="https://cida.usgs.gov/glri/" target="_blank">Great Lakes Restoration Initiative</a></p>
                    <p><a href="http://data.glos.us/obs/" target="_blank">Great Lakes Observing System</a></p>
                    <p><a href="https://www.canada.ca/en/services/environment.html" target="_blank">Environment Canada</a></p>
                </div><!--end .accordion-section-content-->
            </div><!--accordion section-->
            
        </div><!--accordion-->
        
    </div><!--sidebar-->
    
</div>

<script>
$(document).ready(function() {
    //Accordion Code
    function close_accordion_section() {
        $('.accordion .accordion-section-title').removeClass('active');
        $('.accordion .accordion-section-content').slideUp(300).removeClass('open');
    }
 
    $('.accordion-section-title').click(function(e) {
        // Grab current anchor value
        var currentAttrValue = $(this).attr('href');
 
        if($(e.target).is('.active')) {
            close_accordion_section();
        }else {
            close_accordion_section();
 
            // Add active class to section title
            $(this).addClass('active');
            // Open up the hidden content panel
            $('.accordion ' + currentAttrValue).slideDown(300).addClass('open'); 
        }
 
        e.preventDefault();
    });
    
    //Mobile menu toggle
    $('#hamburger').on('click', function(){
        $('#sidebarMenu').toggle('slow');
    });
});
    
</script>
