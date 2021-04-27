import os

import pandas as pd

original_data_path = os.path.join('data', 'vaccines_start.csv')
final_data_path = os.path.join('data', 'vaccines.csv')

orig_df = pd.read_csv(original_data_path)
orig_df['date'] = pd.to_datetime('03-30-2021')
orig_df = orig_df[['FIPS Code', 'Percent adults fully vaccinated against COVID-19', 'date']]
orig_df = orig_df.rename(columns={'FIPS Code': 'FIPS', 'Percent adults fully vaccinated against COVID-19': 'pct_vacc'})
orig_df = orig_df.pivot(index=orig_df.date, columns='FIPS')['pct_vacc']

zero_df = pd.read_csv(original_data_path)
zero_df['date'] = pd.to_datetime('01-15-2021')
zero_df = zero_df[['FIPS Code', 'Percent adults fully vaccinated against COVID-19', 'date']]
zero_df = zero_df.rename(columns={'FIPS Code': 'FIPS', 'Percent adults fully vaccinated against COVID-19': 'pct_vacc'})
zero_df['pct_vacc'] = 0
zero_df = zero_df.pivot(index=zero_df.date, columns='FIPS')['pct_vacc']

date_range = pd.date_range(start='1/15/2021', end='3/30/2021')
date_range_df = pd.DataFrame(data=date_range, columns=['date'])

# add 1st date row with all 0's
orig_df = orig_df.append(zero_df)

merg_df = pd.merge(date_range_df, orig_df, how='left', on='date')
merg_df.set_index('date',inplace=True)

interp_df = merg_df.resample('D').interpolate(method='linear').reset_index()
print(interp_df.tail())
fips_codes = list(interp_df.columns)
fips_codes.remove('date')

df = pd.melt(interp_df, id_vars=['date'], value_vars=fips_codes).rename(columns={'variable': 'id', 'value': 'rate'})
df = df.sort_values(by=['date', 'id'])

df.id = df.id.astype(int)
df['id'] = df['id'].apply(lambda x: '0'+str(x) if x <= 9999 else str(x))
print(df.head())

df.to_csv(final_data_path, index=False)
