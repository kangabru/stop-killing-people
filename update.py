from urllib.request import urlretrieve
from subprocess import call
from os.path import getsize

file_confirmed = "data/confirmed.csv"
file_deaths = "data/deaths.csv"
file_recovered = "data/recovered.csv"

url_confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
url_deaths = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
url_recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"

# Get new files
urlretrieve(url_confirmed, file_confirmed)
urlretrieve(url_deaths, file_deaths)
urlretrieve(url_recovered, file_recovered)

call(["git", "stage", file_confirmed, file_deaths, file_recovered])
call(["git", "commit", "-m", "Updated COVID-19 data."])
call(["git", "push"])