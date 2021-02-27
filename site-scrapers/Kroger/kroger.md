## Get Ohio Zip Codes

Go here:
https://www.zip-codes.com/state/oh.asp#zipcodes

Run this in DevTools console:
```
zips = Array.from(document.querySelectorAll('#tblZIP [title^="ZIP Code"]')).map((el)=> { return  el.innerText.split(' ')[2] })
```

Run this in DevTools to Copy json array to clipboard out of DevTools and to paste into file:
```
copy(zips)
```

See [ohio_zips.json](ohio_zips.json)

## Get Kroger Facilities across all zip codes
for excample::
https://www.kroger.com/rx/api/anonymous/stores?address=43147
```
facilityLocations = new Set()

zipcodes.forEach((zip) => {
    facilities = ask kroger for facilities
    facilities.forEach((facility) => {
        facilityLocations.add(facility)
    }
})
```


## Get Facility Information about Vaccines

for example::
https://www.kroger.com/rx/api/anonymous/scheduler/reasons/pharmacy/01600299
```
allKrogerVacinationInfo = {}

facilityLocations.forEach((facility) => {
    facilityVaccinationInfo = ask kroger for facilityVaccinationInfo
    allKrogerVacinationInfo[facility.facilityId] = facilityVaccinationInfo
})
```