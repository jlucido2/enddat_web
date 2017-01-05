# enddat_web  
Web UI for ENDDaT

## About EnDDaT  
EnDDaT is a tool used to discover data from our natural environment. This tool accesses data from a variety of data sources, compiles and processes the data, and performs common transformations. The end result is that environmental data from multiple sources is sorted into a single table. See the user guide for step-by-step instructions on obtaining data, specifying transforms, and processing data.

## Build instructions  
This project has been built using maven 3.2.x and java 8 and has been deployed to tomcat 8.
To build the war execute the following command in the directory where you cloned the repository.
```
mvn clean package
```
This will produce a .war file in the `target` directory. You can deploy this war file to tomcat like any other war.

## Running the tests
The project includes javascript tests that can be run via maven as part of the test goal. The javascript tests use
the karma test runner. In order to run the tests using a browser of your choice execute the following command:
 ```npm test``` and use the browser of your choice to view http://localhost:9876/ .

The project optionally uses the following JNDI variables in the context.xml. 
```
<Environment name="enddat.development" type="java.lang.String" value="true" /> <!-- Set to true in development when you don't want asset compression -->
<Environment name="enddat.endpoint.service" type="java.lang.String" override="true" value="http://vm_name:8080/enddat-services/"/>
<Environment name="enddat.endpoint.nwis.site" type="java.lang.String" override="true" value=""/>
<Environment name="enddat.endpoint.nwis.statcodes" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.nwis.pmcodes" override="true" type="java.lang.String" value=""/>
<Environment name="enddat.endpoint.precip.wfsgetfeature" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.cidathredds" override="true" type="java.lang.String" value="" />
<Environment name="enddat.cidathredds.precipdata" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.acis" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.ecan" overrider="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.glcfs.wfsgetfeature.erie" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.glcfs.wfsgetfeature.huron" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.glcfs.wfsgetfeature.michigan" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.glcfs.wfsgetfeature.ontario" override="true" type="java.lang.String" value="" />
<Environment name="enddat.endpoint.glcfs.wfsgetfeature.superior" override="true" type="java.lang.String" value="" />
<Environment name="enddat.shapefileupload.geoserver.endpoint" override="true" type="java.lang.String" value="" />
<Environment name="enddat.shapefileupload.geoserver.password" override="false" type="java.lang.String" value="" />
```


## Use Cases  
* Select a project location.
* Set bounding box for the project that indicates area used to discover data.
* Choose data sources to discover data for the bounding area.
* Choose data sources to retrieve available data for bounding area.
* Set time range and filter options for data to be retrieved.
* Select data to download and set transformation options.
* Apply statistic (e.g. mean) an an interval (e.g. 6 hrs) to a dataset.
* Specify file format for download.

## enddat_web Web Services  
These services are part of enddat_web and are called by the Javascript client.  These services are all proxy services except for the Date Service.

http://\<URL to Application\>/service/*  
* use:  To get the data after the project and data sources are selected and transformations are specified.  This makes a call to the loosely coupled enddat-services, which parses the parameters and builds another service call(s) to an external service provider(s). 
* proxy url:  http://localhost:8080/enddat-services/
* example:  http://cida.usgs.gov/enddat/service/execute?style=tab&fill=&download=&DateFormat=Excel&beginPosition=2015-12-31&endPosition=2016-01-31&Lake=michigan&TZ=0_GMT&BeachName=&BeachLat=39.5616159&BeachLon=-105.321744&shapefile=&shapefileFeature=null&filterId=&timeInt=6&NWIS=06710385%3A00060%3A00003%21Discharge%2C+cubic+feet+per+second+Daily+Mean%3A+06710385
