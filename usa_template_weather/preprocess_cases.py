import pandas as pd

df = pd.read_csv('./data/raw_cases.csv')
df = df[df['FIPS'].notna()]
df = df.rename(columns={'FIPS': 'id', 'Incident_Rate': 'rate'})
df = df[['id', 'rate']]

df.id = df.id.astype(int)
#df.id = df.id.astype(str)
df['id'] = df['id'].apply(lambda x: '0'+str(x) if x <= 9999 else str(x))
#df.id = df.id.astype(int)

df['rate'] = df['rate'].fillna(0)
df.rate = df.rate.astype(int)

print(df.head())
print('min Incident_Rate: {}'.format(df['rate'].min()))
print('max Incident_Rate: {}'.format(df['rate'].max()))
df.to_csv('./data/cases.csv', index=False)
