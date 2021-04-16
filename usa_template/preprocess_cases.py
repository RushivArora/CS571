import pandas as pd

df = pd.read_csv('./data/raw_cases.csv')
df = df[df['FIPS'].notna()]
print('min Incident_Rate: {}'.format(df['Incident_Rate'].min()))
print('max Incident_Rate: {}'.format(df['Incident_Rate'].max()))
df.to_csv('./data/cases.csv', index=False)
