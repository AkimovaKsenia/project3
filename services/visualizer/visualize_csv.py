import streamlit as st
import pandas as pd
import os


csv_dir = os.environ.get('CSV_DIR', '/app/csv_out')  


csv_files = [f for f in os.listdir(csv_dir) if f.endswith('.csv')]
csv_file = st.selectbox("Выберите CSV файл", csv_files)


if csv_file:
    df = pd.read_csv(os.path.join(csv_dir, csv_file))
    st.dataframe(df)  
