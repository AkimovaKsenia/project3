program LegacyCSV;

{$mode objfpc}{$H+}

uses
  SysUtils, DateUtils;


function GetEnvDef(const name, def: string): string;
var
  v: string;
begin
  v := GetEnvironmentVariable(name);
  if v = '' then
    Exit(def)
  else
    Exit(v);
end;

function RandFloat(minV, maxV: Double): Double;
begin
  Result := minV + Random * (maxV - minV);
end;

procedure GenerateAndCopy();
var
  outDir, fn, fullpath: string;
  f: TextFile;
  ts: string;
begin
  outDir := GetEnvDef('CSV_OUT_DIR', '/data/csv');
  ts := FormatDateTime('yyyymmdd_hhnnss', Now);
  fn := 'telemetry_' + ts + '.csv';
  fullpath := IncludeTrailingPathDelimiter(outDir) + fn;

  if not DirectoryExists(outDir) then
    ForceDirectories(outDir);

  AssignFile(f, fullpath);
  Rewrite(f);

  
  Writeln(f, 'recorded_at,flag1,flag2,value1,value2,text');

  
  Writeln(f,
    FormatDateTime('yyyy-mm-dd hh:nn:ss', Now) + ',' +
    BoolToStr(Random < 0.5, True) + ',' +
    BoolToStr(Random < 0.5, True) + ',' +
    FormatFloat('0.00', RandFloat(1.0, 100.0)) + ',' +
    FormatFloat('0.00', RandFloat(1.0, 100.0)) + ',' +
    fn);

  CloseFile(f);

  Writeln('CSV created: ', fullpath);
end;


var
  period: Integer;
begin
  Randomize;
  period := StrToIntDef(GetEnvDef('GEN_PERIOD_SEC', '300'), 300);

  while True do
  begin
    try
      GenerateAndCopy();
    except
      on E: Exception do
        Writeln('Legacy error: ', E.Message);
    end;
    Sleep(period*1000);
  end;
end.
