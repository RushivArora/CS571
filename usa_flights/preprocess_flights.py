import pandas as pd
import os

original_data_path = os.path.join('data', 'covid_impact_on_airport_traffic.csv')
final_data_path = os.path.join('data', 'flights.csv')

df = pd.read_csv(original_data_path)
df = df[df['Country'] == 'United States of America (the)']
print(df[['AirportName', 'Centroid']].drop_duplicates())
df = df[['Date','AirportName','PercentOfBaseline']]

df['Date'] = pd.to_datetime(df['Date'])
print(df['Date'].min())
print(df['Date'].max())
date_range = pd.date_range(start=df['Date'].min(), end=df['Date'].max())
date_range_df = pd.DataFrame(data=date_range, columns=['Date'])

df = df.pivot(index=df.Date, columns='AirportName')['PercentOfBaseline']
merge_df = pd.merge(date_range_df, df, how='left', on='Date')
merge_df = merge_df.fillna(method='ffill')
airport_names = list(merge_df.columns)
airport_names.remove('Date')

df = pd.melt(merge_df, id_vars=['Date'], value_vars=airport_names).rename(columns={'variable': 'AirportName', 'value': 'PercentOfBaseline'})
df = df.sort_values(by=['Date', 'AirportName'])
print(df['PercentOfBaseline'].min())
print(df['PercentOfBaseline'].max())
print(df.head())
df.to_csv(final_data_path, index=False)
