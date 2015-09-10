/* global angular */

'use strict';

angular.module('widget.table', ['utils',
    'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns',
    'ui.grid.pinning', 'ui.grid.selection',
    'ui.grid.exporter', 'ui.grid.moveColumns']).config(function() {
});

angular.module('widget.table').controller('tableController', function($scope, messagingService) {
    var self = this;

    self.table = {
        data: [],
        enableColumnResizing: true,
        enableCellEdit: false,
        enableFiltering: true,
        enableGridMenu: true,
        enableRowSelection: true,
        enableSelectAll: true,
        multiSelect: true,
        externalScope: {},
        columnDefs: [],
        getRowId: function (row) {
            return row.id;
        },
        addColumnDefinition: function (name, displayName, width, editable, template, relatedField) {
            this.columnDefs.push({
                name: name,
                displayName: displayName,
                width: width,
                enableCellEdit: editable,
                cellTemplate: template,
                field: relatedField
            });
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        exporterPdfDefaultStyle: {fontSize: 9},
        exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
        exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
        //exporterPdfHeader: "My Header",
        exporterPdfHeaderStyle: { fontSize: 22, bold: true },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4'
        //exporterPdfMaxGridWidth: 500
    };

    messagingService.pub($scope.domain, 'TABLE_ON_LOAD', self.table);
});