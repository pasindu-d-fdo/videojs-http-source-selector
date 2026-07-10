import videojs from "video.js";

const MenuButton = videojs.getComponent("MenuButton");
const MenuItem = videojs.getComponent("MenuItem");

const VERSION = "1.1.7";

class SourceMenuItem extends MenuItem {
    handleClick(event) {
        const childNodes = this.el_.parentNode.children;
        const selected = this.options_;
        const levels = this.player().qualityLevels();

        for (let j = 0; j < childNodes.length; j++) {
            childNodes[j].classList.remove("vjs-selected");
        }

        for (let i = 0; i < levels.length; i++) {
            levels[i].enabled_(false);
            if (selected.index === levels.length) {
                levels[i].enabled_(true);
            } else if (selected.index === i) {
                levels[i].enabled_(true);
            }
        }

        super.handleClick(event);
    }

    buildCSSClass() {
        return `vjs-chapters-button ${super.buildCSSClass()}`;
    }
}

class SourceMenuButton extends MenuButton {
    createEl() {
        return videojs.dom.createEl("div", {
            className:
                "vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button",
        });
    }

    buildCSSClass() {
        return `${MenuButton.prototype.buildCSSClass.call(this)} vjs-icon-cog`;
    }

    update() {
        return MenuButton.prototype.update.call(this);
    }

    createItems() {
        this.options_.selectable = true;
        this.options_.multiSelectable = false;

        const qualityLevels = this.player().qualityLevels();

        if (this.options_ && this.options_.default) {
            if (this.options_.default === "low") {
                for (let i = 0; i < qualityLevels.length; i++) {
                    qualityLevels[i].enabled = i === 0;
                }
            } else if (this.options_.default === "high") {
                for (let i = 0; i < qualityLevels.length; i++) {
                    qualityLevels[i].enabled = i === qualityLevels.length - 1;
                }
            }
        }

        const menuItems = [];
        const levels = this.player().qualityLevels();
        const labels = [];

        for (let i = 0; i < levels.length; i++) {
            const index = levels.length - (i + 1);
            const selected = index === levels.selectedIndex;

            let label = `${index}`;
            let sortVal = index;

            if (levels[index].height) {
                label = `${levels[index].height}p`;
                sortVal = parseInt(levels[index].height, 10);
            } else if (levels[index].bitrate) {
                label = `${Math.floor(levels[index].bitrate / 1e3)} kbps`;
                sortVal = parseInt(levels[index].bitrate, 10);
            }

            if (labels.indexOf(label) >= 0) {
                continue;
            }

            labels.push(label);
            menuItems.push(
                new SourceMenuItem(this.player_, {
                    label,
                    index,
                    selected,
                    sortVal,
                    selectable: true,
                    multiSelectable: false,
                })
            );
        }

        if (levels.length > 1) {
            menuItems.push(
                new SourceMenuItem(this.player_, {
                    label: "Auto",
                    index: levels.length,
                    selected: false,
                    sortVal: 99999,
                    selectable: true,
                    multiSelectable: false,
                })
            );
        }

        menuItems.sort((a, b) => {
            if (a.options_.sortVal < b.options_.sortVal) {
                return 1;
            }
            if (a.options_.sortVal > b.options_.sortVal) {
                return -1;
            }
            return 0;
        });

        return menuItems;
    }
}

const defaults = {};

const onPlayerReady = (player, options) => {
    player.addClass("vjs-http-source-selector");

    if (player.techName_ !== "Html5") {
        return false;
    }

    player.on(["loadedmetadata"], () => {
        if (player.videojs_http_source_selector_initialized === true) {
            return;
        }

        player.videojs_http_source_selector_initialized = true;
        player.controlBar.addChild("SourceMenuButton", {});
    });

    return true;
};

const httpSourceSelector = function httpSourceSelector(options) {
    const self = this;

    self.ready(() => {
        onPlayerReady(self, videojs.mergeOptions(defaults, options));
    });
};

httpSourceSelector.VERSION = VERSION;

if (!videojs.getComponent("SourceMenuButton")) {
    videojs.registerComponent("SourceMenuButton", SourceMenuButton);
}

if (!videojs.getComponent("SourceMenuItem")) {
    videojs.registerComponent("SourceMenuItem", SourceMenuItem);
}

if (typeof videojs.getPlugin === "function") {
    if (!videojs.getPlugin("httpSourceSelector")) {
        videojs.registerPlugin("httpSourceSelector", httpSourceSelector);
    }
} else if (!videojs.prototype.httpSourceSelector) {
    videojs.plugin("httpSourceSelector", httpSourceSelector);
}

export default httpSourceSelector;
