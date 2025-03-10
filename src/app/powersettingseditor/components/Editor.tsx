/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import s from "./Editor.module.css";
import {
  Group,
  FileButton,
  Text,
  Code,
  Stack,
  Tooltip,
  Popover,
  ActionIcon,
  Table,
  NumberInput,
  NativeSelect,
  Tabs,
} from "@mantine/core";
import { IconCopy, IconDownload, IconUpload } from "@tabler/icons-react";
import React from "react";
import { saveAs } from "file-saver";

type PowerSchemes = {
  guid: string;
  name: string;
  settings: Setting[];
}[];

interface Subgroup {
  guid: string;
  name: string;
  alias?: string;
}

interface Option {
  index: number;
  name: string;
}

interface Range {
  min: number;
  max: number;
  increment: number;
  unit: string;
}

interface Setting {
  guid: string;
  name: string;
  alias?: string;
  options?: Option[];
  range?: Range;
  subgroup: Subgroup;
  index: number;
  ac: number;
  dc: number;
}

type SixStateState =
  | "optionName"
  | "optionIndex"
  | "max"
  | "increment"
  | "unit"
  | undefined;

const powerSchemes: PowerSchemes = [];

function parseData(text: string) {
  const lines = text.split("\n").map((line) => line.replace("\r", ""));

  let currentPowerScheme: PowerSchemes[number] = {} as PowerSchemes[number];

  let sixSpacesState: SixStateState;
  let isAc = true;
  let currentSubgroup: Partial<Subgroup> = {};
  let settingOptionIndex = 0;

  let setting: Partial<Setting> = {};
  let index = 0;

  for (const line of lines) {
    const powerSchemeMatch = line.match(/^\S.*: (\S*) {2}(.*)$/m);
    const subgroupMatch = line.match(/^ {2}\S.*: (\S*) {2}(.*)$/m);
    const subgroupAliasMatch = line.match(/^ {4}\S.*: (?!0x)(\S*)$/m);
    const powerSettingMatch = line.match(/^ {4}\S.*: (\S*) {2}(.*)$/m);
    const sixSpacesMatch = line.match(/^ {6}\S.*: (.*)$/m);
    const powerSettingIndexMatch = line.match(/^ {4}\S.*: (0x\S*)$/m);

    if (powerSchemeMatch) {
      if (currentPowerScheme.guid) {
        powerSchemes.push(currentPowerScheme);
      }

      currentPowerScheme = {
        guid: powerSchemeMatch[1],
        name: powerSchemeMatch[2].slice(1, -1),
        settings: [],
      };
    } else if (subgroupMatch) {
      currentSubgroup = {
        guid: subgroupMatch[1],
        name: subgroupMatch[2].slice(1, -1),
      };
    } else if (subgroupAliasMatch) {
      currentSubgroup.alias = subgroupAliasMatch[1];
    } else if (powerSettingMatch) {
      setting.guid = powerSettingMatch[1];
      setting.name = powerSettingMatch[2].slice(1, -1);
    } else if (sixSpacesMatch) {
      const result = sixSpacesMatch[1];

      if (!sixSpacesState) {
        if (sixSpacesMatch[0].includes("GUID")) {
          setting.alias = result;
        } else if (result === "000") {
          setting.options = [{ index: 0 } as Option];
          sixSpacesState = "optionName";
        } else if (result.startsWith("0x")) {
          setting.range = { min: parseInt(result, 16) } as Range;
          sixSpacesState = "max";
        }
      } else if (sixSpacesState === "optionName") {
        setting.options![settingOptionIndex++].name = result;
        sixSpacesState = "optionIndex";
      } else if (sixSpacesState === "optionIndex") {
        setting.options![settingOptionIndex] = {
          index: settingOptionIndex,
        } as Option;
        sixSpacesState = "optionName";
      } else if (sixSpacesState === "max") {
        setting.range!.max = parseInt(result, 16);
        sixSpacesState = "increment";
      } else if (sixSpacesState === "increment") {
        setting.range!.increment = parseInt(result, 16);
        sixSpacesState = "unit";
      } else {
        setting.range!.unit = result;
      }
    } else if (powerSettingIndexMatch) {
      if (isAc) {
        setting.ac = parseInt(powerSettingIndexMatch[1], 16);
        isAc = false;
      } else {
        setting.dc = parseInt(powerSettingIndexMatch[1], 16);
        isAc = true;

        setting.subgroup = currentSubgroup as Subgroup;
        setting.index = index++;
        currentPowerScheme.settings.push(setting as Setting);
        setting = {};
      }

      sixSpacesState = undefined;
      settingOptionIndex = 0;
    }
  }

  powerSchemes.push(currentPowerScheme);
}

function downloadPlan() {
  let batch = "";

  for (const powerScheme of powerSchemes) {
    batch += `@echo ${powerScheme.name} (${powerScheme.guid})\n\n`;

    for (const setting of powerScheme.settings) {
      const subgroupId = setting.subgroup.alias ?? setting.subgroup.guid;
      const settingId = setting.alias ?? setting.guid;

      batch +=
        `@echo ${setting.subgroup.name}: ${setting.name}\n` +
        `powercfg /setacvalueindex ${
          powerScheme.guid
        } ${subgroupId} ${settingId} ${setting.ac.toString()}\n` +
        `powercfg /setdcvalueindex ${
          powerScheme.guid
        } ${subgroupId} ${settingId} ${setting.dc.toString()}\n\n`;
    }
  }

  saveAs(new Blob([batch.trimEnd()]), "power_settings.bat");
}

async function handleUpload(
  file: File,
  resetRef: React.RefObject<() => void>,
  setReady: React.Dispatch<React.SetStateAction<boolean>>
) {
  const text = await file.text();
  parseData(text);
  setReady((previous) => !previous);
  resetRef.current?.();
}

function ValueWrapper({
  setting,
  children,
  type,
  powerSchemeGuid,
}: {
  setting: Setting;
  children: React.ReactNode;
  type: "ac" | "dc";
  powerSchemeGuid: string;
}) {
  return (
    <Group justify="space-between" align="end" wrap="nowrap">
      {children}
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => {
          void navigator.clipboard.writeText(
            `powercfg /set${type}valueindex ${powerSchemeGuid} ${
              setting.subgroup.alias ?? setting.subgroup.guid
            } ${setting.alias ?? setting.guid} ${setting[type].toString()}`
          );
        }}
      >
        <IconCopy />
      </ActionIcon>
    </Group>
  );
}

function Values({
  setting,
  powerSchemeGuid,
}: {
  setting: Setting;
  powerSchemeGuid: string;
}) {
  if (setting.options) {
    return (
      <>
        <ValueWrapper
          setting={setting}
          powerSchemeGuid={powerSchemeGuid}
          type="ac"
        >
          <NativeSelect
            className={s.flexGrow}
            label="AC"
            defaultValue={setting.options[setting.ac].index}
            data={setting.options.map((option) => {
              return {
                label: option.name,
                value: option.index.toString(),
              };
            })}
            onChange={(ev) => {
              setting.ac = parseInt(ev.target.value, 10);
            }}
          />
        </ValueWrapper>
        <ValueWrapper
          setting={setting}
          powerSchemeGuid={powerSchemeGuid}
          type="dc"
        >
          <NativeSelect
            className={s.flexGrow}
            label="DC"
            defaultValue={setting.options[setting.dc].index}
            data={setting.options.map((option) => {
              return {
                label: option.name,
                value: option.index.toString(),
              };
            })}
            onChange={(ev) => {
              setting.dc = parseInt(ev.target.value, 10);
            }}
          />
        </ValueWrapper>
      </>
    );
  } else if (setting.range) {
    return (
      <>
        <ValueWrapper
          setting={setting}
          powerSchemeGuid={powerSchemeGuid}
          type="ac"
        >
          <NumberInput
            className={s.flexGrow}
            label="AC"
            defaultValue={setting.ac}
            onChange={(value) => {
              if (typeof value === "number") {
                setting.ac = value;
              }
            }}
            min={setting.range.min}
            max={setting.range.max}
            step={setting.range.increment}
            clampBehavior="strict"
            allowNegative={false}
            allowDecimal={false}
            stepHoldDelay={250}
            stepHoldInterval={1}
          />
        </ValueWrapper>
        <ValueWrapper
          setting={setting}
          powerSchemeGuid={powerSchemeGuid}
          type="dc"
        >
          <NumberInput
            className={s.flexGrow}
            label="DC"
            defaultValue={setting.dc}
            onChange={(value) => {
              if (typeof value === "number") {
                setting.dc = value;
              }
            }}
            min={setting.range.min}
            max={setting.range.max}
            step={setting.range.increment}
            clampBehavior="strict"
            allowNegative={false}
            allowDecimal={false}
            stepHoldDelay={250}
            stepHoldInterval={1}
          />
        </ValueWrapper>
      </>
    );
  }

  return (
    <>
      <ValueWrapper
        setting={setting}
        powerSchemeGuid={powerSchemeGuid}
        type="ac"
      >
        <NumberInput
          className={s.flexGrow}
          label="AC"
          defaultValue={setting.ac}
          onChange={(value) => {
            if (typeof value === "number") {
              setting.ac = value;
            }
          }}
          min={0}
          clampBehavior="strict"
          allowNegative={false}
          allowDecimal={false}
          stepHoldDelay={250}
          stepHoldInterval={1}
        />
      </ValueWrapper>
      <ValueWrapper
        setting={setting}
        powerSchemeGuid={powerSchemeGuid}
        type="dc"
      >
        <NumberInput
          className={s.flexGrow}
          label="DC"
          defaultValue={setting.dc}
          onChange={(value) => {
            if (typeof value === "number") {
              setting.dc = value;
            }
          }}
          min={0}
          clampBehavior="strict"
          allowNegative={false}
          allowDecimal={false}
          stepHoldDelay={250}
          stepHoldInterval={1}
        />
      </ValueWrapper>
    </>
  );
}

function PossibleValues({ setting }: { setting: Setting }) {
  if (setting.options) {
    return setting.options.map((option) => (
      <Text key={option.index}>{option.name}</Text>
    ));
  } else if (setting.range) {
    return (
      <>
        <Text>Min: {setting.range.min}</Text>
        <Text>Max: {setting.range.max}</Text>
        <Text>Step: {setting.range.increment}</Text>
        <Text>Unit: {setting.range.unit}</Text>
      </>
    );
  }
}

export default function Editor() {
  const [ready, setReady] = React.useState(false);
  const resetRef = React.useRef<() => void>(null);

  return (
    <>
      <Group className={s.buttons}>
        {ready ? (
          <ActionIcon
            size="3rem"
            variant="subtle"
            color="gray"
            aria-label="Download Power Plan"
            onClick={() => {
              downloadPlan();
            }}
          >
            <IconDownload size="3rem" />
          </ActionIcon>
        ) : (
          <FileButton
            resetRef={resetRef}
            accept=".txt"
            onChange={(file) => {
              if (file) {
                void handleUpload(file, resetRef, setReady);
              }
            }}
          >
            {(props) => (
              <ActionIcon
                size="3rem"
                variant="subtle"
                color="gray"
                aria-label="Upload powersettings.txt"
                {...props}
              >
                <IconUpload size="3rem" />
              </ActionIcon>
            )}
          </FileButton>
        )}
      </Group>
      {ready ? (
        <Tabs variant="pills" defaultValue="0">
          <Tabs.List className={s.stickyBottom}>
            {powerSchemes.map((powerScheme, index) => (
              <Tabs.Tab value={index.toString()} key={powerScheme.guid}>
                {powerScheme.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Table withColumnBorders stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Text className={s.fontWeight}>Subgroup</Text>
                </Table.Th>
                <Table.Th>
                  <Text className={s.fontWeight}>Setting</Text>
                </Table.Th>
                <Table.Th>
                  <Text className={s.fontWeight}>Value</Text>
                </Table.Th>
                <Table.Th>
                  <Text className={s.fontWeight}>Possible Values</Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {powerSchemes[0].settings.map((setting, settingIndex) => (
                <Table.Tr key={setting.index}>
                  <Popover
                    withArrow
                    arrowSize={12}
                    transitionProps={{ duration: 0 }}
                  >
                    <Popover.Target>
                      <Table.Td className={s.cursor}>
                        <Text>{setting.subgroup.name}</Text>
                      </Table.Td>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text>{`GUID: ${setting.subgroup.guid}`}</Text>
                      {setting.subgroup.alias && (
                        <Text>{`ALIAS: ${setting.subgroup.alias}`}</Text>
                      )}
                    </Popover.Dropdown>
                  </Popover>
                  <Popover
                    withArrow
                    arrowSize={12}
                    transitionProps={{ duration: 0 }}
                  >
                    <Popover.Target>
                      <Table.Td className={s.cursor}>
                        <Text>{setting.name}</Text>
                      </Table.Td>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text>{`GUID: ${setting.guid}`}</Text>
                      {setting.alias && (
                        <Text>{`ALIAS: ${setting.alias}`}</Text>
                      )}
                    </Popover.Dropdown>
                  </Popover>
                  <Table.Td>
                    {powerSchemes.map((powerScheme, powerSchemeIndex) => (
                      <Tabs.Panel
                        value={powerSchemeIndex.toString()}
                        key={powerScheme.guid}
                      >
                        <Values
                          setting={
                            powerSchemes[powerSchemeIndex].settings[
                              settingIndex
                            ]
                          }
                          powerSchemeGuid={powerScheme.guid}
                        />
                      </Tabs.Panel>
                    ))}
                  </Table.Td>
                  <Table.Td>
                    <PossibleValues setting={setting} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs>
      ) : (
        <Stack>
          <Text className={s.bigFont}>
            Save and execute this as a .bat file:
          </Text>
          <Tooltip label="Click to copy to clipboard">
            <Code
              className={`${s.bigFont} ${s.cursor}`}
              block
              onClick={() => {
                void navigator.clipboard.writeText(
                  `if exist power_settings.txt del power_settings.txt\n` +
                    `for /f "tokens=4" %%G in ('powercfg /list ^| findstr /C:"GUID:"') do (\n` +
                    `    powercfg /qh %%G >> power_settings.txt\n` +
                    `)`
                );
              }}
            >
              {`if exist power_settings.txt del power_settings.txt\n` +
                `for /f "tokens=4" %%G in ('powercfg /list ^| findstr /C:"GUID:"') do (\n` +
                `    powercfg /qh %%G >> power_settings.txt\n` +
                `)`}
            </Code>
          </Tooltip>
          <Text className={s.bigFont}>Upload power_settings.txt</Text>
        </Stack>
      )}
    </>
  );
}
