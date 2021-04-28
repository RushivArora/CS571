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

    sw_utah = ['49001', '49021', '49025', '49053', ]
    se_utah = ['49017', '49019', '49055']
    ct_utah = ['49015', '49023', '49027', '49031', '49039', '49041', ]
    tri_utah = ['49007', '49009', '49013', '49047', ]
    bear_utah = ['49003', '49005', '49029', '49033', '49057']
    utah_mapping = {
        'Southwest Utah': sw_utah,
        'Southeast Utah': se_utah,
        'Central Utah': ct_utah,
        'TriCounty': tri_utah,
        'Bear River': bear_utah,
    }
    id_name = {
        '49001': 'Beaver',
        '49003': 'Box Elder',
        '49005': 'Cache',
        '49007': 'Carbon',
        '49009': 'Dagget',
        '49013': 'Duchesne',
        '49015': 'Emery',
        '49017': 'Garfield',
        '49019': 'Grand',
        '49021': 'Iron',
        '49023': 'Juab',
        '49025': 'Kane',
        '49027': 'Millard',
        '49029': 'Morgan',
        '49031': 'Piute',
        '49033': 'Rich',
        '49039': 'Sanpete',
        '49041': 'Sevier',
        '49047': 'Uintah',
        '49053': 'Washington',
        '49055': 'Wayne',
        '49057': 'Weber',
    }

    for i,region in enumerate(utah_mapping.keys()):
        tmp_df.loc[tmp_df.Admin2 == region, 'FIPS'] = 10000000 + i

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

    for i,(region, FIPSs) in enumerate(utah_mapping.items()):
        for fips in FIPSs:
            add_row = tmp_df[tmp_df.id == str(10000000 + i)]
            add_row['id'] = fips
            add_row['name'] = id_name[fips]
            tmp_df = tmp_df.append(add_row, ignore_index=True)

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
