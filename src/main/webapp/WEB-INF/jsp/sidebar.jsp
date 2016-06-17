
<div id="sidebar">
    <h3 id="mobileMenuText">Menu</h3>
    <i id="hamburger" class="fa fa-bars" aria-hidden="true"></i>
    
    <div id="sidebarMenu">
        
        <div class="accordion">
            
            <div class="accordion-section">
                <a class="accordion-section-title" href="#accordion-1">Resources</a>
                
                <div id="accordion-1" class="accordion-section-content">
                    <p><a href="UserGuide.jsp" target="_blank">User Guide</a></p>
                    <p><a href="VersionUpdates.jsp" target="_blank">Version Updates</a></p>
                </div><!--end .accordion-section-content-->
            </div><!--accordion section-->
            
            <div class="accordion-section">
                <a class="accordion-section-title" href="#accordion-2">Data Sources</a>
                
                <div id="accordion-2" class="accordion-section-content">
                    <p><a href="http://waterdata.usgs.gov/nwis" target="_blank">NWIS</a></p>
                    <p><a href="http://data.glos.us/glcfs/" target="_blank">GLCFS</a></p>
                    <p><a href="http://www.waterqualitydata.us/" target="_blank">Water Quality Portal</a></p>
                    <p><a href="http://cida.usgs.gov/gdp/" target="_blank">Geo Data Portal</a></p>
                    <p><a href="http://www.hpc.ncep.noaa.gov/npvu/" target="_blank">Precipitation</a></p>
                </div><!--end .accordion-section-content-->
            </div><!--accordion section-->
            
            <div class="accordion-section">
                <a class="accordion-section-title" href="#accordion-3">Partners</a>
                
                <div id="accordion-3" class="accordion-section-content">
                    <p><a href="http://cida.usgs.gov/glri/" target="_blank">GLRI</a></p>
                    <p><a href="http://data.glos.us/obs/" target="_blank">GLOS</a></p>
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