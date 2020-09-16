# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# TODO not working

a = Analysis(['tauntaun_live_editor/camp.py'],
             pathex=['live_editor/backend/tauntaun_live_editor'],
             binaries=[],
             datas=[        
        ('../../env/lib/python3.8/site-packages/dcs/terrain/caucasus.p', 'dcs/terrain/'),
('../../env/lib/python3.8/site-packages/dcs/terrain/nevada.p', 'dcs/terrain/')        ],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='live_editor',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='live_editor')
