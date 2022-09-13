import React from "react";
import { Drawer } from "@mantine/core";
import DrawerContent from "./DrawerContent";

const SettingsDrawer = ({ opened, setOpened }) => {
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        padding="lg"
        size="lg"
        overlayOpacity={0.25}
        transition="scale-x"
        transitionDuration={3000}
        transitionTimingFunction="ease"
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};

export default SettingsDrawer;
