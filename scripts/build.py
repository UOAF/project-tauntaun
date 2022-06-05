import subprocess as sp
import os
import shutil


def run_cmd(cmd, *args, **kwargs):
    result = sp.run(cmd, *args, **kwargs)
    code = result.returncode
    if code != 0:
        raise ValueError(f"Command \"{cmd}\"  failed with exit code {code}")


def run_node_cmd(cmd, suffix='cmd'):
    # hack to handle the fact that all node commands need a .cmd extension
    # when called from a Python shell on windows
    if os.name == 'nt':
        tokens = cmd.split()
        tokens[0] = f'{tokens[0]}.{suffix}'
        cmd = ' '.join(tokens)
    run_cmd(cmd)


def get_file_path():
    this_script_path = os.path.realpath(__file__)
    dir, _ = os.path.split(this_script_path)
    return dir


def main():
    root = os.path.abspath(os.path.join(get_file_path(), '..'))
    print(root)
    os.chdir(root)
    sp.run('git submodule update --init --recursive')
    os.chdir(os.path.join(root, 'frontend'))
    shutil.rmtree(os.path.join(root, 'frontend', 'node_modules'), ignore_errors=True)
    run_node_cmd("yarn install")
    run_node_cmd('yarn build')
    cpsrc = os.path.join(root, 'frontend', 'build')
    cpdst = os.path.join(root, 'tauntaun_live_editor', 'data', 'client')
    print(f'Copying from {cpsrc} to {cpdst}.')
    shutil.copytree(cpsrc, cpdst, dirs_exist_ok=True)
    run_node_cmd('poetry build', 'bat')


if __name__ == '__main__':
    main()
