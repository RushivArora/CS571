import pandas as pd
import os

raw_file_path = './data/csse_covid_19_daily_reports'

final_df = pd.DataFrame(columns=['id', 'rate', 'name', 'date'])

for raw_file in os.listdir(raw_file_path):

    if not '.csv' in raw_file:
        continue

    tmp_df = pd.read_csv(os.path.join(raw_file_path, raw_file))

    #print('processing: {}.'.format(raw_file))
    if 'FIPS' not in tmp_df.columns:
        print('skipping {}, no county data.'.format(raw_file))
        continue

    tmp_df = tmp_df[tmp_df['FIPS'].notna()]

    if 'Incidence_Rate' not in tmp_df.columns and 'Incident_Rate' not in tmp_df.columns:
        print('skipping {}, no rate data.'.format(raw_file))
        continue

    tmp_df = tmp_df.rename(columns={'Incidence_Rate': 'rate'})
    tmp_df = tmp_df.rename(columns={'FIPS': 'id', 'Incident_Rate': 'rate', 'Admin2': 'name'})
    tmp_df = tmp_df[['id', 'rate', 'name']]

    tmp_df.id = tmp_df.id.astype(int)
    tmp_df['id'] = tmp_df['id'].apply(lambda x: '0'+str(x) if x <= 9999 else str(x))

    tmp_df['rate'] = tmp_df['rate'].fillna(0)
    tmp_df.rate = tmp_df.rate.astype(int)

    tmp_df['date'] = raw_file.replace('.csv', '')

    #print(tmp_df.shape[0])
    #print(tmp_df.head())

    if final_df.empty:
        final_df = tmp_df
    else:
        final_df = final_df.append(tmp_df, ignore_index=True)

print(final_df.shape[0])
print(final_df.head())
print('min Incident_Rate: {}'.format(final_df['rate'].min()))
print('max Incident_Rate: {}'.format(final_df['rate'].max()))
final_df.to_csv('./data/cases.csv', index=False)
