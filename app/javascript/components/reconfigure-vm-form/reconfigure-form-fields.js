import { componentTypes } from '@@ddf';
import { dataTableHeaders, restructureOptions, socketChange } from './helper';
import { setDiskData } from './helpers/disk';
import { setNetworkData } from './helpers/network';
import { setDrivesData } from './helpers/drive';
import { TYPES } from './helpers/general';

const memoryField = (roles) => ({
  component: 'switch',
  name: 'cb_memory',
  label: __('Memory'),
  onText: __('Yes'),
  offText: __('No'),
  isDisabled: roles.allowMemoryChange === false,
});

const memoryValueField = () => ({
  component: componentTypes.TEXT_FIELD,
  name: 'memory',
  label: __('Memory Size'),
  initialValue: 16,
  isRequired: true,
  condition: {
    when: 'cb_memory',
    is: true,
  },
  validate: [{ type: 'memoryCheck' }],
});

const memoryTypeField = (memory) => ({
  component: componentTypes.SELECT,
  id: 'memoryType',
  name: 'mem_type',
  label: __('Memory Type'),
  initialValue: 'GB',
  options: restructureOptions([__('GB'), __('MB')]),
  helperText: __(`Between ${memory.min}MB and ${memory.max / 1024}GB`),
  condition: {
    when: 'cb_memory',
    is: true,
  },
});

const processorField = (roles) => ({
  component: 'switch',
  name: 'processor',
  label: __('Processor'),
  onText: __('Yes'),
  offText: __('No'),
  isDisabled: roles.allowCpuChange === false,
});

const socketField = (data, setData, options) => ({
  component: componentTypes.SELECT,
  id: 'socket',
  name: 'socket_count',
  label: __('Sockets'),
  options: restructureOptions(options),
  hideField: options.length === 0,
  onChange: (value) => socketChange(value, data, setData, 'socket'),
  condition: {
    when: 'processor',
    is: true,
  },
  validate: [{ type: 'cpuCheck', field: 'socket' }],
});

const coresPerSocketField = (data, setData, options) => ({
  component: componentTypes.SELECT,
  id: 'cores',
  name: 'cores_per_socket_count',
  label: __('Cores Per Socket'),
  options: restructureOptions(options),
  onChange: (value) => socketChange(value, data, setData, 'cores'),
  validate: [{ type: 'cpuCheck', field: 'cores' }],
  hideField: options.length === 0,
  condition: {
    when: 'processor',
    is: true,
  },
});

const totalProcessorsField = (value) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'total_cpus',
  name: 'total_cpus',
  label: __('Total Processors'),
  isReadOnly: true,
  type: 'number',
  initialValue: value,
  condition: {
    when: 'processor',
    is: true,
  },
});

const diskTable = (data, roles, setData, onCellClick, buttonClick) => ({
  component: 'reconfigure-table',
  name: 'disk',
  label: __('Disks'),
  headers: dataTableHeaders('disk', roles),
  rows: data.dataTable.disks ? setDiskData(data.dataTable.disks, roles, data, setData) : [],
  onCellClick,
  formType: TYPES.DISK,
  addButtonLabel: __('Add Disk'),
  buttonClick,
});

const networkTable = (data, roles, setData, onCellClick, buttonClick) => ({
  component: 'reconfigure-table',
  name: 'network',
  label: __('Network Adapters'),
  headers: dataTableHeaders('network', roles),
  rows: data.dataTable.networkAdapters ? setNetworkData(data.dataTable.networkAdapters, roles, data, setData) : [],
  onCellClick,
  formType: TYPES.NETWORK,
  addButtonLabel: __('Add Network'),
  buttonClick,
});

const driveTable = (data, roles, setData, onCellClick) => ({
  component: 'reconfigure-table',
  name: 'drive',
  label: __('CD/DVD Drives'),
  headers: dataTableHeaders('drive', roles),
  rows: data.dataTable.drives ? setDrivesData(data.dataTable.drives, data) : [],
  onCellClick,
  addButton: false,
  formType: TYPES.DRIVE,
  hideField: data.dataTable.drives.length === 0,
});

const renderDatatables = (recordId, data, roles, setData, onCellClick, buttonClick) => {
  if (recordId.length === 1) {
    return [diskTable(data, roles, setData, onCellClick, buttonClick),
      networkTable(data, roles, setData, onCellClick, buttonClick),
      driveTable(data, roles, setData, onCellClick)];
  }
  return '';
};

export const reconfigureFormFields = (recordId, roles, memory, data, setData, options, onCellClick, buttonClick) => ([
  memoryField(roles),
  memoryValueField(),
  memoryTypeField(memory),
  processorField(roles),
  socketField(data, setData, options.socket_options, memory.max_cpu),
  coresPerSocketField(data, setData, options.cores_options, memory.max_cpu),
  totalProcessorsField(data.socket * data.cores),
  renderDatatables(recordId, data, roles, setData, onCellClick, buttonClick),
]);
